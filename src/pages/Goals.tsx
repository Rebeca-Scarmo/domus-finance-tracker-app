
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Target, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Goal, Budget, Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryManager from '@/components/CategoryManager';
import GoalContribution from '@/components/GoalContribution';

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

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
      if (budgetsResult.data) {
        setBudgets(budgetsResult.data.map(item => ({
          ...item,
          period: item.period as 'weekly' | 'monthly' | 'yearly',
          category: item.category ? {
            ...item.category,
            type: item.category.type as 'income' | 'expense'
          } : undefined
        })));
      }
    } catch (error) {
      console.error('Error loading goals and budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const handleBackToGoals = () => {
    setSelectedGoal(null);
    loadGoalsAndBudgets(); // Refresh data when going back
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#DDDDDD]">Carregando...</div>
      </div>
    );
  }

  // Show goal detail view when a goal is selected
  if (selectedGoal) {
    const progress = (selectedGoal.current_amount / selectedGoal.target_amount) * 100;
    const daysLeft = Math.max(0, Math.ceil(
      (new Date(selectedGoal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    ));

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBackToGoals}
            variant="outline"
            className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#DDDDDD]">{selectedGoal.name}</h1>
        </div>

        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader className="pb-3">
            <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-start md:space-y-0">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-[#DDDDDD] text-xl">
                  {selectedGoal.name}
                </CardTitle>
                {selectedGoal.description && (
                  <p className="text-[#7C7C7C] text-sm mt-1">
                    {selectedGoal.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-[#7C7C7C] text-sm flex-shrink-0">
                <Calendar className="h-4 w-4" />
                {daysLeft === 0 ? 'Hoje!' : `${daysLeft} dias`}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#7C7C7C]">
                  Progresso: {progress.toFixed(1)}%
                </span>
                <span className={`text-sm font-medium ${
                  selectedGoal.is_completed ? 'text-green-500' : 'text-[#EEB3E7]'
                }`}>
                  {selectedGoal.is_completed ? 'Concluída!' : 'Em andamento'}
                </span>
              </div>
              <div className="w-full bg-[#7C7C7C] rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    selectedGoal.is_completed ? 'bg-green-500' : 'bg-[#EEB3E7]'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-lg font-medium">
                <span className="text-[#DDDDDD]">
                  R$ {selectedGoal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[#7C7C7C]">
                  R$ {selectedGoal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <GoalContribution goal={selectedGoal} onContribution={loadGoalsAndBudgets} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#DDDDDD]">Metas & Orçamentos</h1>
          <p className="text-[#7C7C7C] text-sm md:text-base">Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
          <Button
            onClick={() => navigate('/goals/new')}
            className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 h-12 md:h-auto w-full md:w-auto"
          >
            <Target className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
          <Button
            onClick={() => navigate('/budgets/new')}
            variant="outline"
            className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C] h-12 md:h-auto w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#000000] border border-[#7C7C7C]">
          <TabsTrigger value="goals" className="text-[#DDDDDD] data-[state=active]:bg-[#EEB3E7] data-[state=active]:text-[#000000]">
            Metas
          </TabsTrigger>
          <TabsTrigger value="budgets" className="text-[#DDDDDD] data-[state=active]:bg-[#EEB3E7] data-[state=active]:text-[#000000]">
            Orçamentos
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-[#DDDDDD] data-[state=active]:bg-[#EEB3E7] data-[state=active]:text-[#000000]">
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-[#DDDDDD] flex items-center gap-2">
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
                    className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 h-12 md:h-auto w-full md:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira meta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {goals.map((goal) => {
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  const daysLeft = Math.max(0, Math.ceil(
                    (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  ));

                  return (
                    <Card
                      key={goal.id}
                      className="bg-[#000000] border-[#7C7C7C] hover:border-[#EEB3E7] transition-colors cursor-pointer"
                      onClick={() => handleGoalClick(goal)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-start md:space-y-0">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-[#DDDDDD] text-base md:text-lg truncate">
                              {goal.name}
                            </CardTitle>
                            {goal.description && (
                              <p className="text-[#7C7C7C] text-sm mt-1">
                                {goal.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[#7C7C7C] text-sm flex-shrink-0">
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
                          <div className="flex justify-between text-xs md:text-sm">
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
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-[#DDDDDD] flex items-center gap-2">
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
                    className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C] h-12 md:h-auto w-full md:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro orçamento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: budget.category?.color || '#7C7C7C' }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[#DDDDDD] truncate">
                                {budget.category?.name}
                              </p>
                              <p className="text-sm text-[#7C7C7C]">
                                {periodText} • {budget.is_recurring ? 'Recorrente' : 'Único'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="font-bold text-[#EEB3E7] text-sm md:text-base">
                              R$ {budget.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs md:text-sm text-[#7C7C7C]">
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
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryManager onCategoryCreated={loadGoalsAndBudgets} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
