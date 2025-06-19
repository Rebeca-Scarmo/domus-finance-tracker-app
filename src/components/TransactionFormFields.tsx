
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';

interface FormData {
  description: string;
  amount: string;
  type: 'income' | 'expense';
  date: string;
  is_recurring: boolean;
  recurrence_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined;
  category_id: string;
}

interface TransactionFormFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function TransactionFormFields({ formData, setFormData }: TransactionFormFieldsProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
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

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <>
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
            min="0.01"
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
          <Label className="text-[#DDDDDD]">Categoria</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
              <SelectValue placeholder="Selecione uma categoria (opcional)" />
            </SelectTrigger>
            <SelectContent className="bg-[#000000] border-[#7C7C7C] z-50">
              <SelectItem value="" className="text-[#DDDDDD] hover:bg-[#7C7C7C]">Sem categoria</SelectItem>
              {filteredCategories.map((category) => (
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
    </>
  );
}
