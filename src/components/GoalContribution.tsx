
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { transactionOperations } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface GoalContributionProps {
  goalId: string;
  goalName: string;
  onContributionAdded: () => void;
}

export function GoalContribution({ goalId, goalName, onContributionAdded }: GoalContributionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleContribution = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Faça login para continuar.",
          variant: "destructive",
        });
        return;
      }

      // Criar transação de despesa para a meta
      const transactionData = {
        user_id: user.id,
        description: `Contribuição para meta: ${goalName}`,
        amount: parseFloat(amount),
        type: 'expense' as const,
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurrence_type: null,
        category_id: null,
      };

      const transactionResult = await transactionOperations.create(transactionData);

      if (transactionResult.error) {
        throw new Error(transactionResult.error.message || 'Erro ao criar transação');
      }

      // Atualizar o valor atual da meta
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('current_amount')
        .eq('id', goalId)
        .single();

      if (goalError) throw goalError;

      const newCurrentAmount = (goal.current_amount || 0) + parseFloat(amount);

      const { error: updateError } = await supabase
        .from('goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId);

      if (updateError) throw updateError;

      toast({
        title: "Contribuição adicionada!",
        description: `R$ ${parseFloat(amount).toFixed(2)} foi adicionado à sua meta.`,
      });

      setAmount('');
      setIsOpen(false);
      onContributionAdded();
    } catch (error: any) {
      console.error('Erro ao adicionar contribuição:', error);
      toast({
        title: "Erro ao adicionar contribuição",
        description: error.message || "Não foi possível adicionar a contribuição.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 w-full sm:w-auto"
      >
        <Plus className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Adicionar</span>
        <span className="sm:hidden">Valor</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#000000] border-[#7C7C7C] mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-[#DDDDDD]">
              Adicionar Valor à Meta
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-name" className="text-[#DDDDDD]">Meta</Label>
              <Input
                id="goal-name"
                value={goalName}
                disabled
                className="bg-[#000000] border-[#7C7C7C] text-[#7C7C7C]"
              />
            </div>

            <div>
              <Label htmlFor="contribution-amount" className="text-[#DDDDDD]">Valor (R$)</Label>
              <Input
                id="contribution-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] placeholder:text-[#7C7C7C]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleContribution}
                disabled={loading}
                className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 w-full sm:w-auto"
              >
                {loading ? 'Adicionando...' : 'Adicionar Contribuição'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C] w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
