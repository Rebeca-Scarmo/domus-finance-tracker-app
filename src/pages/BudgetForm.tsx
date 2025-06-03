
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';

export default function BudgetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    is_recurring: true
  });

  useEffect(() => {
    loadCategories();
    if (id) {
      loadBudget();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories((data || []).map(item => ({
        ...item,
        type: item.type as 'income' | 'expense'
      })));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBudget = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          category_id: data.category_id,
          amount: data.amount.toString(),
          period: data.period as 'weekly' | 'monthly' | 'yearly',
          start_date: data.start_date,
          is_recurring: data.is_recurring
        });
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      toast({
        title: "Erro ao carregar orçamento",
        description: "Não foi possível carregar os dados do orçamento.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const budgetData = {
        user_id: user.id,
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        period: formData.period,
        start_date: formData.start_date,
        is_recurring: formData.is_recurring
      };

      if (id) {
        const { error } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Orçamento atualizado!",
          description: "Seu orçamento foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([budgetData]);

        if (error) throw error;

        toast({
          title: "Orçamento criado!",
          description: "Seu orçamento foi criado com sucesso.",
        });
      }

      navigate('/goals');
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: "Erro ao salvar orçamento",
        description: "Não foi possível salvar o orçamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/goals')}
          className="text-[#DDDDDD] hover:bg-[#7C7C7C]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#DDDDDD]">
            {id ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h1>
          <p className="text-[#7C7C7C]">
            {id ? 'Atualize seu orçamento' : 'Defina um novo orçamento para categoria'}
          </p>
        </div>
      </div>

      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader>
          <CardTitle className="text-[#DDDDDD] flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#EEB3E7]" />
            Informações do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category_id" className="text-[#DDDDDD]">Categoria</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                  <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000000] border-[#7C7C7C]">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-[#DDDDDD] hover:bg-[#7C7C7C]">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-[#DDDDDD]">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0,00"
                  required
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] placeholder:text-[#7C7C7C]"
                />
              </div>

              <div>
                <Label htmlFor="period" className="text-[#DDDDDD]">Período</Label>
                <Select value={formData.period} onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setFormData({ ...formData, period: value })}>
                  <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000000] border-[#7C7C7C]">
                    <SelectItem value="weekly" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Semanal</SelectItem>
                    <SelectItem value="monthly" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Mensal</SelectItem>
                    <SelectItem value="yearly" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_date" className="text-[#DDDDDD]">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
              >
                {loading ? 'Salvando...' : (id ? 'Atualizar Orçamento' : 'Criar Orçamento')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/goals')}
                className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C]"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
