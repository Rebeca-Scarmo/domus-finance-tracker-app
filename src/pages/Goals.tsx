
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Goal, Budget, Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoalsAndBudgets();
  }, []);

  const loadGoalsAndBudgets = async () => {
    try {
      const [goalsResult, budgetsResult] = await Promise.all([
        supabase
          .from('goals')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('budgets')
          .select(`
            *,
            category:categories(*)
          `)
          .order('created_at', { ascending: false })
      ]);

      if (goalsResult.data) setGoals(goalsResult.data);
      if (budgetsResult.data) setBudgets(budgetsResult.data);
    } catch (error) {
      console.error('Error loading goals and budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#DDDDDD]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#DDDDDD]">Metas & Orçamentos</h1>
          <p className="text-[#7C7C7C]">Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/goals/new')}
            className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
          >
            <Target className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
          <Button
            onClick={() => navigate('/budgets/new')}
            variant="outline"
            className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goals Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#DDDDDD] flex items-center gap-2">
              <Target className="h-5 w-5 text-[#EEB3E7]" />
              Metas Financeiras
            </h2>
          </div>

          {goals.length === 0 ? (
            <Card className="bg-[#000000] border-[#7C7C7C]">
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-[#7C7C7C] mx-auto mb-4" />
                <p className="text-[#7C7C7C] mb-4">Nenhuma meta definida</p>
                <Button
                  onClick={() => navigate('/goals/new')}
                  className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira meta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                const daysLeft = Math.max(0, Math.ceil(
                  (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                ));

                return (
                  <Card
                    key={goal.id}
                    className="bg-[#000000] border-[#7C7C7C] hover:border-[#EEB3E7] transition-colors cursor-pointer"
                    onClick={() => navigate(`/goals/${goal.id}`)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-[#DDDDDD] text-lg">
                            {goal.name}
                          </CardTitle>
                          {goal.description && (
                            <p className="text-[#7C7C7C] text-sm mt-1">
                              {goal.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[#7C7C7C] text-sm">
                          <Calendar className="h-4 w-4" />
                          {daysLeft === 0 ? 'Hoje!' : `${daysLeft} dias`}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#7C7C7C]">
                            Progresso: {progress.toFixed(1)}%
                          </span>
                          <span className={`text-sm font-medium ${
                            goal.is_completed ? 'text-green-500' : 'text-[#EEB3E7]'
                          }`}>
                            {goal.is_completed ? 'Concluída!' : 'Em andamento'}
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
                        <div className="flex justify-between text-sm">
                          <span className="text-[#DDDDDD]">
                            R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[#7C7C7C]">
                            R$ {goal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Budgets Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#DDDDDD] flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#EEB3E7]" />
              Orçamentos
            </h2>
          </div>

          {budgets.length === 0 ? (
            <Card className="bg-[#000000] border-[#7C7C7C]">
              <CardContent className="text-center py-12">
                <Plus className="h-12 w-12 text-[#7C7C7C] mx-auto mb-4" />
                <p className="text-[#7C7C7C] mb-4">Nenhum orçamento definido</p>
                <Button
                  onClick={() => navigate('/budgets/new')}
                  variant="outline"
                  className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro orçamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const periodText = {
                  weekly: 'Semanal',
                  monthly: 'Mensal',
                  yearly: 'Anual'
                }[budget.period];

                return (
                  <Card
                    key={budget.id}
                    className="bg-[#000000] border-[#7C7C7C] hover:border-[#EEB3E7] transition-colors cursor-pointer"
                    onClick={() => navigate(`/budgets/${budget.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: budget.category?.color || '#7C7C7C' }}
                          />
                          <div>
                            <p className="font-medium text-[#DDDDDD]">
                              {budget.category?.name}
                            </p>
                            <p className="text-sm text-[#7C7C7C]">
                              {periodText} • {budget.is_recurring ? 'Recorrente' : 'Único'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#EEB3E7]">
                            R$ {budget.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-[#7C7C7C]">
                            Limite {periodText.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
