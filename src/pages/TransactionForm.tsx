
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function TransactionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurrence_type: undefined as string | undefined,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadTransaction();
    }
  }, [id]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await (supabase as any)
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        throw error;
      }
      
      console.log('Categories loaded:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias. Verifique se você está logado.",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadTransaction = async () => {
    if (!id) return;

    try {
      const { data, error } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          description: data.description,
          amount: data.amount.toString(),
          type: data.type,
          category_id: data.category_id,
          date: data.date,
          is_recurring: data.is_recurring,
          recurrence_type: data.recurrence_type,
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
    
    if (!formData.category_id) {
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await (supabase as any).auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar transações.",
          variant: "destructive",
        });
        return;
      }

      const transactionData = {
        user_id: user.id,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category_id: formData.category_id,
        date: formData.date,
        is_recurring: formData.is_recurring,
        recurrence_type: formData.is_recurring ? formData.recurrence_type : null,
      };

      console.log('Saving transaction:', transactionData);

      if (isEditing) {
        const { error } = await (supabase as any)
          .from('transactions')
          .update(transactionData)
          .eq('id', id);

        if (error) {
          console.error('Error updating transaction:', error);
          throw error;
        }

        toast({
          title: "Transação atualizada!",
          description: "A transação foi atualizada com sucesso.",
        });
      } else {
        const { error } = await (supabase as any)
          .from('transactions')
          .insert([transactionData]);

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

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/transactions')}
          className="text-[#DDDDDD] hover:bg-[#7C7C7C] flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[#DDDDDD] truncate">
            {isEditing ? 'Editar Transação' : 'Nova Transação'}
          </h1>
          <p className="text-[#7C7C7C] text-sm md:text-base">
            {isEditing ? 'Atualize os dados da transação' : 'Registre uma nova receita ou despesa'}
          </p>
        </div>
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
                    setFormData({ ...formData, type: value, category_id: '' });
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
                <Label className="text-[#DDDDDD]">Categoria *</Label>
                {loadingCategories ? (
                  <div className="text-[#7C7C7C] text-sm">Carregando categorias...</div>
                ) : (
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#000000] border-[#7C7C7C] z-50">
                      {filteredCategories.length === 0 ? (
                        <div className="p-2 text-[#7C7C7C] text-sm">
                          {categories.length === 0 
                            ? 'Nenhuma categoria encontrada. Você precisa estar logado.'
                            : `Nenhuma categoria de ${formData.type === 'income' ? 'receita' : 'despesa'} encontrada.`
                          }
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="text-[#DDDDDD] hover:bg-[#7C7C7C]">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
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
                    onValueChange={(value) => setFormData({ ...formData, recurrence_type: value })}
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
                disabled={loading || loadingCategories}
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
