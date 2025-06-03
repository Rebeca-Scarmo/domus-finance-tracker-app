
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function GoalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    start_date: new Date().toISOString().split('T')[0],
    target_date: ''
  });

  useEffect(() => {
    if (id) {
      loadGoal();
    }
  }, [id]);

  const loadGoal = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          description: data.description || '',
          target_amount: data.target_amount.toString(),
          start_date: data.start_date,
          target_date: data.target_date
        });
      }
    } catch (error) {
      console.error('Error loading goal:', error);
      toast({
        title: "Erro ao carregar meta",
        description: "Não foi possível carregar os dados da meta.",
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

      const goalData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        target_amount: parseFloat(formData.target_amount),
        start_date: formData.start_date,
        target_date: formData.target_date
      };

      if (id) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Meta atualizada!",
          description: "Sua meta foi atualizada com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('goals')
          .insert([goalData]);

        if (error) throw error;

        toast({
          title: "Meta criada!",
          description: "Sua meta foi criada com sucesso.",
        });
      }

      navigate('/goals');
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Erro ao salvar meta",
        description: "Não foi possível salvar a meta. Tente novamente.",
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
            {id ? 'Editar Meta' : 'Nova Meta'}
          </h1>
          <p className="text-[#7C7C7C]">
            {id ? 'Atualize sua meta financeira' : 'Defina uma nova meta financeira'}
          </p>
        </div>
      </div>

      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader>
          <CardTitle className="text-[#DDDDDD] flex items-center gap-2">
            <Target className="h-5 w-5 text-[#EEB3E7]" />
            Informações da Meta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="name" className="text-[#DDDDDD]">Nome da Meta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Viagem para Europa"
                  required
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] placeholder:text-[#7C7C7C]"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-[#DDDDDD]">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da sua meta..."
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] placeholder:text-[#7C7C7C]"
                />
              </div>

              <div>
                <Label htmlFor="target_amount" className="text-[#DDDDDD]">Valor da Meta (R$)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  placeholder="0,00"
                  required
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] placeholder:text-[#7C7C7C]"
                />
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

              <div>
                <Label htmlFor="target_date" className="text-[#DDDDDD]">Data Meta</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
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
                {loading ? 'Salvando...' : (id ? 'Atualizar Meta' : 'Criar Meta')}
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
