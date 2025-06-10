
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GoalContribution } from '@/components/GoalContribution';

interface Goal {
  id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  is_completed: boolean;
}

export default function Goals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Meta excluída!",
        description: "A meta foi excluída com sucesso.",
      });

      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Erro ao excluir meta",
        description: "Não foi possível excluir a meta.",
        variant: "destructive",
      });
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#DDDDDD]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#DDDDDD]">Metas</h1>
          <p className="text-[#7C7C7C] text-sm md:text-base">Acompanhe seus objetivos financeiros</p>
        </div>
        <Button
          onClick={() => navigate('/goals/new')}
          className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardContent className="p-8 md:p-12 text-center">
            <Target className="h-12 w-12 text-[#7C7C7C] mx-auto mb-4" />
            <p className="text-[#7C7C7C] mb-4">Nenhuma meta definida ainda</p>
            <Button
              onClick={() => navigate('/goals/new')}
              className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
            const daysRemaining = getDaysRemaining(goal.target_date);
            const isCompleted = goal.current_amount >= goal.target_amount;

            return (
              <Card key={goal.id} className="bg-[#000000] border-[#7C7C7C]">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-[#DDDDDD] flex flex-wrap items-center gap-2 text-lg sm:text-xl">
                        <Target className="h-5 w-5 text-[#EEB3E7] flex-shrink-0" />
                        <span className="truncate">{goal.name}</span>
                        {isCompleted && (
                          <span className="text-xs bg-[#EEB3E7] text-[#000000] px-2 py-1 rounded-full whitespace-nowrap">
                            Concluída
                          </span>
                        )}
                      </CardTitle>
                      {goal.description && (
                        <p className="text-[#7C7C7C] text-sm mt-1 line-clamp-2">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:gap-2 w-full sm:w-auto">
                      <GoalContribution
                        goalId={goal.id}
                        goalName={goal.name}
                        onContributionAdded={loadGoals}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/goals/${goal.id}`)}
                          className="text-[#DDDDDD] hover:bg-[#7C7C7C] flex-shrink-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-[#7C7C7C] hover:bg-red-500/20 hover:text-red-400 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#DDDDDD]">Progresso</span>
                      <span className="text-[#EEB3E7] font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-[#7C7C7C]">
                      <span>R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>R$ {goal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <div className="flex items-center gap-1 text-[#7C7C7C]">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {daysRemaining > 0 
                          ? `${daysRemaining} dias restantes`
                          : daysRemaining === 0
                          ? 'Prazo é hoje'
                          : `${Math.abs(daysRemaining)} dias em atraso`
                        }
                      </span>
                    </div>
                    <div className="text-[#7C7C7C] truncate">
                      até {new Date(goal.target_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
