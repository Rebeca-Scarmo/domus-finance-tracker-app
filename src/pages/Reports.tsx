
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';

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

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<TransactionData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [goalsProgress, setGoalsProgress] = useState<any[]>([]);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      // Carregar transações
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .order('date', { ascending: false });

      // Carregar metas
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactions) {
        processTransactionData(transactions);
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
    let income = 0;
    let expense = 0;

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
        income += parseFloat(transaction.amount);
      } else {
        monthData.expense += parseFloat(transaction.amount);
        expense += parseFloat(transaction.amount);

        // Processar categorias apenas para gastos
        const categoryName = transaction.categories?.name || 'Sem categoria';
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
    setTotalIncome(income);
    setTotalExpense(expense);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#DDDDDD]">Carregando relatórios...</div>
      </div>
    );
  }

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-4 px-4 py-4 max-w-full overflow-x-hidden">
      <div className="text-center">
        <h1 className="text-xl font-bold text-[#DDDDDD]">Relatórios</h1>
        <p className="text-[#7C7C7C] text-sm">Análise das suas finanças</p>
      </div>

      {/* Cards de Resumo - Stack em mobile */}
      <div className="grid grid-cols-1 gap-3">
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#7C7C7C] text-sm">Receitas</p>
                <p className="text-lg font-bold text-[#EEB3E7]">
                  R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-[#EEB3E7]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#7C7C7C] text-sm">Despesas</p>
                <p className="text-lg font-bold text-[#7C7C7C]">
                  R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="h-6 w-6 text-[#7C7C7C]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#7C7C7C] text-sm">Saldo</p>
                <p className={`text-lg font-bold ${balance >= 0 ? 'text-[#EEB3E7]' : 'text-[#7C7C7C]'}`}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className={`h-6 w-6 ${balance >= 0 ? 'text-[#EEB3E7]' : 'text-[#7C7C7C]'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Stack em mobile para evitar scroll horizontal */}
      <div className="space-y-4">
        {/* Gráfico de Receitas vs Despesas */}
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

        {/* Lista de categorias para mobile (quando o gráfico fica pequeno) */}
        {categoryData.length > 0 && (
          <Card className="bg-[#000000] border-[#7C7C7C]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#DDDDDD] text-base">Detalhes por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-[#7C7C7C]/10 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-[#DDDDDD] text-sm">{category.name}</span>
                    </div>
                    <span className="text-[#DDDDDD] text-sm font-medium">
                      R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
