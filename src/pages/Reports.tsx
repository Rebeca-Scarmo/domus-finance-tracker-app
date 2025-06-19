import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Target, AlertTriangle, TrendingDown } from 'lucide-react';

interface TransactionData {
  month: string;
  income: number;
  expense: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface BudgetData {
  category: string;
  budgeted: number;
  spent: number;
  color: string;
  percentage: number;
}

interface ComparisonData {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<TransactionData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [goalsProgress, setGoalsProgress] = useState<any[]>([]);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      // Carregar transações com suas categorias
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            type
          )
        `)
        .order('date', { ascending: false });

      // Carregar categorias
      const { data: categories } = await supabase
        .from('categories')
        .select('*');

      // Carregar orçamentos com suas categorias
      const { data: budgets } = await supabase
        .from('budgets')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            type
          )
        `)
        .order('created_at', { ascending: false });

      // Carregar metas
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactions) {
        processTransactionData(transactions);
        processComparisonData(transactions);
      }

      if (budgets && transactions) {
        processBudgetData(budgets, transactions);
      }

      if (goals) {
        setGoalsProgress(goals);
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTransactionData = (transactions: any[]) => {
    // Processar dados mensais
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    // Processar dados por categoria
    const categoryMap = new Map<string, { value: number; color: string }>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      
      if (transaction.type === 'income') {
        monthData.income += parseFloat(transaction.amount);
      } else {
        monthData.expense += parseFloat(transaction.amount);

        // Processar categorias apenas para gastos
        const categoryName = transaction.categories?.name || 'Sem Categoria';
        const categoryColor = transaction.categories?.color || '#7C7C7C';
        
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, { value: 0, color: categoryColor });
        }
        
        categoryMap.get(categoryName)!.value += parseFloat(transaction.amount);
      }
    });

    // Converter para arrays
    const monthlyArray = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      ...data
    })).slice(-6); // Últimos 6 meses

    const categoryArray = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      ...data
    }));

    setMonthlyData(monthlyArray);
    setCategoryData(categoryArray);
  };

  const processComparisonData = (transactions: any[]) => {
    const yearlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const yearKey = date.getFullYear().toString();

      if (!yearlyMap.has(yearKey)) {
        yearlyMap.set(yearKey, { income: 0, expense: 0 });
      }

      const yearData = yearlyMap.get(yearKey)!;
      
      if (transaction.type === 'income') {
        yearData.income += parseFloat(transaction.amount);
      } else {
        yearData.expense += parseFloat(transaction.amount);
      }
    });

    const comparisonArray = Array.from(yearlyMap.entries()).map(([period, data]) => ({
      period,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    })).sort((a, b) => a.period.localeCompare(b.period));

    setComparisonData(comparisonArray);
  };

  const processBudgetData = (budgets: any[], transactions: any[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const budgetMap = new Map<string, { budgeted: number; color: string; categoryId: string }>();
    const spentMap = new Map<string, number>();

    // Processar orçamentos
    budgets.forEach((budget) => {
      const categoryName = budget.categories?.name || 'Categoria Desconhecida';
      const categoryColor = budget.categories?.color || '#7C7C7C';
      const categoryId = budget.categories?.id || budget.category_id;
      
      if (!budgetMap.has(categoryName)) {
        budgetMap.set(categoryName, { budgeted: 0, color: categoryColor, categoryId });
      }
      
      budgetMap.get(categoryName)!.budgeted += parseFloat(budget.amount);
    });

    // Processar gastos do mês atual por categoria
    transactions.forEach((transaction) => {
      if (transaction.type === 'expense') {
        const date = new Date(transaction.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          const categoryName = transaction.categories?.name || 'Sem Categoria';
          const categoryId = transaction.categories?.id;
          
          // Só contar gastos que têm categoria e essa categoria tem orçamento
          if (categoryId) {
            const budgetEntry = Array.from(budgetMap.entries()).find(([_, data]) => data.categoryId === categoryId);
            if (budgetEntry) {
              const [budgetCategoryName] = budgetEntry;
              if (!spentMap.has(budgetCategoryName)) {
                spentMap.set(budgetCategoryName, 0);
              }
              spentMap.set(budgetCategoryName, spentMap.get(budgetCategoryName)! + parseFloat(transaction.amount));
            }
          }
        }
      }
    });

    const budgetArray = Array.from(budgetMap.entries()).map(([category, data]) => {
      const spent = spentMap.get(category) || 0;
      const percentage = data.budgeted > 0 ? (spent / data.budgeted) * 100 : 0;
      
      return {
        category,
        budgeted: data.budgeted,
        spent,
        color: data.color,
        percentage
      };
    });

    setBudgetData(budgetArray);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#DDDDDD]">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-4 max-w-full overflow-x-hidden">
      <div className="text-center">
        <h1 className="text-xl font-bold text-[#DDDDDD]">Relatórios</h1>
        <p className="text-[#7C7C7C] text-sm">Análise detalhada das suas finanças</p>
      </div>

      {/* Gráfico de Acompanhamento de Orçamento */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#DDDDDD] text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#EEB3E7]" />
            Acompanhamento de Orçamento
          </CardTitle>
          <p className="text-[#7C7C7C] text-xs">Mês atual vs orçamento planejado</p>
        </CardHeader>
        <CardContent className="p-2">
          {budgetData.length === 0 ? (
            <p className="text-[#7C7C7C] text-center py-4 text-sm">Nenhum orçamento criado ainda</p>
          ) : (
            <div className="space-y-3">
              {budgetData.map((budget, index) => {
                const isOverBudget = budget.percentage > 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#DDDDDD] font-medium text-sm">{budget.category}</span>
                      <span className={`text-xs ${isOverBudget ? 'text-[#7C7C7C]' : 'text-[#EEB3E7]'}`}>
                        {budget.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#7C7C7C]/30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isOverBudget ? 'bg-[#7C7C7C]' : 'bg-[#EEB3E7]'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[#7C7C7C]">
                      <span>Gasto: R$ {budget.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Orçado: R$ {budget.budgeted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Comparação Anual */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#DDDDDD] text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#EEB3E7]" />
            Comparação Anual
          </CardTitle>
          <p className="text-[#7C7C7C] text-xs">Evolução das receitas e despesas</p>
        </CardHeader>
        <CardContent className="p-2">
          <ChartContainer
            config={{
              income: { label: "Receitas", color: "#EEB3E7" },
              expense: { label: "Despesas", color: "#7C7C7C" },
              balance: { label: "Saldo", color: "#DDDDDD" }
            }}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7C7C7C" />
                <XAxis 
                  dataKey="period" 
                  stroke="#DDDDDD" 
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#DDDDDD" 
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="income" stroke="#EEB3E7" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#7C7C7C" strokeWidth={2} />
                <Line type="monotone" dataKey="balance" stroke="#DDDDDD" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Receitas vs Despesas Mensal */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#DDDDDD] text-base">Receitas vs Despesas</CardTitle>
          <p className="text-[#7C7C7C] text-xs">Últimos 6 meses</p>
        </CardHeader>
        <CardContent className="p-2">
          <ChartContainer
            config={{
              income: { label: "Receitas", color: "#EEB3E7" },
              expense: { label: "Despesas", color: "#7C7C7C" }
            }}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7C7C7C" />
                <XAxis 
                  dataKey="month" 
                  stroke="#DDDDDD" 
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#DDDDDD" 
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="income" fill="#EEB3E7" />
                <Bar dataKey="expense" fill="#7C7C7C" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Gastos por Categoria */}
      {categoryData.length > 0 && (
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#DDDDDD] text-base">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ChartContainer
              config={{}}
              className="h-[200px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    fontSize={8}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Progresso das Metas */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#DDDDDD] text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-[#EEB3E7]" />
            Progresso das Metas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {goalsProgress.length === 0 ? (
            <p className="text-[#7C7C7C] text-center py-4 text-sm">Nenhuma meta criada ainda</p>
          ) : (
            <div className="space-y-3">
              {goalsProgress.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#DDDDDD] font-medium text-sm">{goal.name}</span>
                      <span className="text-[#7C7C7C] text-xs">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#7C7C7C]/30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          goal.is_completed ? 'bg-[#EEB3E7]' : 'bg-[#EEB3E7]'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[#7C7C7C]">
                      <span>R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>R$ {goal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
