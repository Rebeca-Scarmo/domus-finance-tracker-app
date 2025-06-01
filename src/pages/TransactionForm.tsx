
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabaseClient, transactionOperations } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DatabaseTransaction } from '@/types/database';

export default function TransactionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurrence_type: undefined as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadTransaction();
    }
  }, [id]);

  const loadTransaction = async () => {
    if (!id) return;

    try {
      const { data, error } = await transactionOperations.getById(id);

      if (error) throw error;
      if (data) {
        setFormData({
          description: data.description,
          amount: data.amount.toString(),
          type: data.type,
          date: data.date,
          is_recurring: data.is_recurring,
          recurrence_type: data.recurrence_type || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
      toast({
        title: "Erro ao carregar transação",
        description: "Não foi possível carregar os dados da transação.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim() || !formData.amount) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar transações.",
          variant: "destructive",
        });
        return;
      }

      const transactionData: Omit<DatabaseTransaction, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date,
        is_recurring: formData.is_recurring,
        recurrence_type: formData.is_recurring ? formData.recurrence_type || null : null,
        category_id: null,
      };

      console.log('Saving transaction:', transactionData);

      if (isEditing) {
        const { error } = await transactionOperations.update(id!, transactionData);

        if (error) {
          console.error('Error updating transaction:', error);
          throw error;
        }

        toast({
          title: "Transação atualizada!",
          description: "A transação foi atualizada com sucesso.",
        });
      } else {
        const { error } = await transactionOperations.create(transactionData);

        if (error) {
          console.error('Error creating transaction:', error);
          throw error;
        }

        toast({
          title: "Transação criada!",
          description: "A transação foi registrada com sucesso.",
        });
      }

      navigate('/transactions');
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a transação. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[#DDDDDD]">
          {isEditing ? 'Editar Transação' : 'Nova Transação'}
        </h1>
        <p className="text-[#7C7C7C] text-sm md:text-base">
          {isEditing ? 'Atualize os dados da transação' : 'Registre uma nova receita ou despesa'}
        </p>
      </div>

      {/* Form */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader>
          <CardTitle className="text-[#DDDDDD]">Dados da Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#DDDDDD]">
                  Descrição *
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7]"
                  placeholder="Ex: Salário, Supermercado, Gasolina..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-[#DDDDDD]">
                  Valor *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7]"
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#DDDDDD]">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'income' | 'expense') => {
                    setFormData({ ...formData, type: value });
                  }}
                >
                  <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000000] border-[#7C7C7C] z-50">
                    <SelectItem value="income" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Receita</SelectItem>
                    <SelectItem value="expense" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-[#DDDDDD]">
                  Data *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7]"
                />
              </div>

              {formData.is_recurring && (
                <div className="space-y-2">
                  <Label className="text-[#DDDDDD]">Frequência</Label>
                  <Select
                    value={formData.recurrence_type}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => 
                      setFormData({ ...formData, recurrence_type: value })
                    }
                  >
                    <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#000000] border-[#7C7C7C] z-50">
                      <SelectItem value="daily" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Diário</SelectItem>
                      <SelectItem value="weekly" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Semanal</SelectItem>
                      <SelectItem value="monthly" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Mensal</SelectItem>
                      <SelectItem value="yearly" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => 
                  setFormData({ 
                    ...formData, 
                    is_recurring: !!checked,
                    recurrence_type: checked ? formData.recurrence_type : undefined
                  })
                }
                className="border-[#7C7C7C] data-[state=checked]:bg-[#EEB3E7] data-[state=checked]:border-[#EEB3E7]"
              />
              <Label htmlFor="recurring" className="text-[#DDDDDD]">
                Transação recorrente
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/transactions')}
                className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
              >
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
