
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Goal } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [transactionsResult, goalsResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .limit(5),
        supabase
          .from('goals')
          .select('*')
          .eq('is_completed', false)
          .limit(3)
      ]);

      if (transactionsResult.data) setTransactions(transactionsResult.data);
      if (goalsResult.data) setGoals(goalsResult.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#DDDDDD]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#DDDDDD]">Tela Inicial</h1>
          <p className="text-[#7C7C7C] text-sm md:text-base">Visão geral das suas finanças</p>
        </div>
        <Button
          onClick={() => navigate('/transactions/new')}
          className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 h-12 md:h-auto w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#DDDDDD]">
              Saldo Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#EEB3E7]" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold ${balance >= 0 ? 'text-[#EEB3E7]' : 'text-[#7C7C7C]'}`}>
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#DDDDDD]">
              Receitas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#EEB3E7]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-[#EEB3E7]">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#DDDDDD]">
              Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-[#7C7C7C]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-[#7C7C7C]">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#DDDDDD]">
              Metas Ativas
            </CardTitle>
            <Target className="h-4 w-4 text-[#EEB3E7]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-[#EEB3E7]">
              {goals.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD]">Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-[#7C7C7C] text-center py-4">
                Nenhuma transação encontrada
              </p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#7C7C7C]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#DDDDDD] truncate">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-[#7C7C7C]">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`font-bold text-sm md:text-base ${
                      transaction.type === 'income' ? 'text-[#EEB3E7]' : 'text-[#7C7C7C]'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD]">Progresso das Metas</CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-[#7C7C7C] text-center py-4">
                Nenhuma meta ativa
              </p>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-[#DDDDDD] truncate flex-1 mr-2">{goal.name}</p>
                        <p className="text-sm text-[#7C7C7C]">
                          {progress.toFixed(1)}%
                        </p>
                      </div>
                      <div className="w-full bg-[#7C7C7C] rounded-full h-2">
                        <div
                          className="bg-[#EEB3E7] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs md:text-sm text-[#7C7C7C]">
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
