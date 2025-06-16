
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Goal } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus } from 'lucide-react';

interface GoalContributionProps {
  goal: Goal;
  onContribution: () => void;
}

export default function GoalContribution({ goal, onContribution }: GoalContributionProps) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleContribution = async (type: 'add' | 'subtract') => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const contributionAmount = parseFloat(amount);
      const newCurrentAmount = type === 'add' 
        ? goal.current_amount + contributionAmount
        : Math.max(0, goal.current_amount - contributionAmount);

      const isCompleted = newCurrentAmount >= goal.target_amount;

      // Update goal current amount
      const { error: updateError } = await supabase
        .from('goals')
        .update({ 
          current_amount: newCurrentAmount,
          is_completed: isCompleted
        })
        .eq('id', goal.id);

      if (updateError) throw updateError;

      // Record the contribution
      const { error: contributionError } = await supabase
        .from('goal_contributions')
        .insert({
          goal_id: goal.id,
          amount: type === 'add' ? contributionAmount : -contributionAmount,
          description: type === 'add' ? 'Contribuição adicionada' : 'Contribuição removida'
        });

      if (contributionError) throw contributionError;

      toast({
        title: "Contribuição registrada!",
        description: `${type === 'add' ? 'Adicionado' : 'Removido'} R$ ${contributionAmount.toFixed(2)} ${type === 'add' ? 'à' : 'da'} meta.`,
      });

      setAmount('');
      onContribution();
    } catch (error: any) {
      console.error('Error updating goal:', error);
      toast({
        title: "Erro ao registrar contribuição",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#000000] border-[#7C7C7C] mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#DDDDDD] text-lg">
          Contribuir para a Meta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              type="number"
              placeholder="Valor da contribuição"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] placeholder:text-[#7C7C7C]"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => handleContribution('add')}
              disabled={loading || !amount}
              className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 flex-1 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
            <Button
              onClick={() => handleContribution('subtract')}
              disabled={loading || !amount}
              variant="outline"
              className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C] flex-1 flex items-center justify-center gap-2"
            >
              <Minus className="h-4 w-4" />
              Remover
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
