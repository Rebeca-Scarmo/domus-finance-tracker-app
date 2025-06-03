
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#DDDDDD]">Relatórios</h1>
        <p className="text-[#7C7C7C] text-sm md:text-base">Análise das suas finanças</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#7C7C7C] text-sm">Receitas</p>
                <p className="text-2xl font-bold text-green-500">
                  R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#7C7C7C] text-sm">Despesas</p>
                <p className="text-2xl font-bold text-red-500">
                  R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#7C7C7C] text-sm">Saldo</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receitas vs Despesas */}
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD]">Receitas vs Despesas (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                income: { label: "Receitas", color: "#22C55E" },
                expense: { label: "Despesas", color: "#EF4444" }
              }}
              className="h-[300px]"
            >
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7C7C7C" />
                <XAxis dataKey="month" stroke="#DDDDDD" />
                <YAxis stroke="#DDDDDD" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="income" fill="#22C55E" />
                <Bar dataKey="expense" fill="#EF4444" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Gastos por Categoria */}
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD]">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Progresso das Metas */}
        <Card className="bg-[#000000] border-[#7C7C7C] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD] flex items-center gap-2">
              <Target className="h-5 w-5 text-[#EEB3E7]" />
              Progresso das Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goalsProgress.length === 0 ? (
              <p className="text-[#7C7C7C] text-center py-8">Nenhuma meta criada ainda</p>
            ) : (
              <div className="space-y-4">
                {goalsProgress.map((goal) => {
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#DDDDDD] font-medium">{goal.name}</span>
                        <span className="text-[#7C7C7C] text-sm">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-[#7C7C7C] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            goal.is_completed ? 'bg-green-500' : 'bg-[#EEB3E7]'
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
