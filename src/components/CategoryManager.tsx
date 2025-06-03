
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Palette, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';

interface CategoryManagerProps {
  onCategoryCreated?: () => void;
}

export default function CategoryManager({ onCategoryCreated }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#EEB3E7'
  });
  const { toast } = useToast();

  const colors = [
    '#EEB3E7', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

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

      const { error } = await supabase
        .from('categories')
        .insert([{
          user_id: user.id,
          name: formData.name.trim(),
          type: formData.type,
          color: formData.color
        }]);

      if (error) throw error;

      toast({
        title: "Categoria criada!",
        description: "Sua categoria foi criada com sucesso.",
      });

      setFormData({ name: '', type: 'expense', color: '#EEB3E7' });
      loadCategories();
      onCategoryCreated?.();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Erro ao criar categoria",
        description: "Não foi possível criar a categoria. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Categoria excluída!",
        description: "A categoria foi removida com sucesso.",
      });

      loadCategories();
      onCategoryCreated?.();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro ao excluir categoria",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader>
          <CardTitle className="text-[#DDDDDD] flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#EEB3E7]" />
            Nova Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-[#DDDDDD]">Nome da Categoria</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Supermercado"
                  required
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] placeholder:text-[#7C7C7C]"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-[#DDDDDD]">Tipo</Label>
                <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000000] border-[#7C7C7C]">
                    <SelectItem value="expense" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Despesa</SelectItem>
                    <SelectItem value="income" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-[#DDDDDD] flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4" />
                Cor da Categoria
              </Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color ? 'border-[#DDDDDD] scale-110' : 'border-[#7C7C7C]'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 w-full"
            >
              {loading ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader>
          <CardTitle className="text-[#DDDDDD]">Categorias Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-[#7C7C7C] text-center py-4">
              Nenhuma categoria criada ainda
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#7C7C7C]/10 border border-[#7C7C7C]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="text-[#DDDDDD] font-medium">{category.name}</p>
                      <p className="text-[#7C7C7C] text-sm">
                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                      </p>
                    </div>
                  </div>
                  {!category.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
