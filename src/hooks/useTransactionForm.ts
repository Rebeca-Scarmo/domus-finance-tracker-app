
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient, transactionOperations } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DatabaseTransaction } from '@/types/database';

interface FormData {
  description: string;
  amount: string;
  type: 'income' | 'expense';
  date: string;
  is_recurring: boolean;
  recurrence_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined;
}

export function useTransactionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<FormData>({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurrence_type: undefined,
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

      if (error) {
        console.error('Error loading transaction:', error);
        throw error;
      }
      
      if (data) {
        setFormData({
          description: data.description,
          amount: data.amount.toString(),
          type: data.type,
          date: data.date,
          is_recurring: data.is_recurring,
          recurrence_type: data.recurrence_type as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
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
    console.log('=== INICIANDO SALVAMENTO ===');
    console.log('Dados do formulário:', formData);

    // Validação básica
    if (!formData.description.trim()) {
      console.log('Erro: Descrição vazia');
      toast({
        title: "Campo obrigatório",
        description: "A descrição é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      console.log('Erro: Valor inválido');
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verificar autenticação
      console.log('Verificando autenticação...');
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError) {
        console.error('Erro de autenticação:', userError);
        throw new Error('Erro de autenticação. Faça login novamente.');
      }
      
      if (!user) {
        console.error('Usuário não encontrado');
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }

      console.log('Usuário autenticado:', user.id);

      // Preparar dados para salvar
      const transactionData: Omit<DatabaseTransaction, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date,
        is_recurring: formData.is_recurring,
        recurrence_type: formData.is_recurring && formData.recurrence_type ? formData.recurrence_type : null,
        category_id: null,
      };

      console.log('Dados preparados para salvar:', transactionData);

      let result;
      
      if (isEditing) {
        console.log('Atualizando transação existente...');
        result = await transactionOperations.update(id!, transactionData);
      } else {
        console.log('Criando nova transação...');
        result = await transactionOperations.create(transactionData);
      }

      if (result.error) {
        console.error('Erro na operação:', result.error);
        throw new Error(result.error.message || 'Erro ao salvar transação');
      }

      console.log('Transação salva com sucesso:', result.data);

      toast({
        title: isEditing ? "Transação atualizada!" : "Transação criada!",
        description: isEditing ? "A transação foi atualizada com sucesso." : "A transação foi registrada com sucesso.",
      });

      navigate('/transactions');
    } catch (error: any) {
      console.error('=== ERRO NO SALVAMENTO ===');
      console.error('Erro completo:', error);
      
      let errorMessage = "Não foi possível salvar a transação.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    isEditing,
    handleSubmit,
    navigate,
  };
}
