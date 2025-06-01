
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
    console.log('Form submitted with data:', formData);

    if (!formData.description.trim() || !formData.amount) {
      console.log('Validation failed: missing required fields');
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      console.log('Validation failed: invalid amount');
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Checking user authentication...');
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError) {
        console.error('Authentication error:', userError);
        throw new Error('Erro de autenticação: ' + userError.message);
      }
      
      if (!user) {
        console.error('No user found');
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }

      console.log('User authenticated:', user.id);

      const transactionData: Omit<DatabaseTransaction, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date,
        is_recurring: formData.is_recurring,
        recurrence_type: formData.is_recurring ? (formData.recurrence_type || null) : null,
        category_id: null,
      };

      console.log('Transaction data to save:', transactionData);

      if (isEditing) {
        console.log('Updating existing transaction...');
        const { data, error } = await transactionOperations.update(id!, transactionData);

        if (error) {
          console.error('Error updating transaction:', error);
          throw new Error('Erro ao atualizar transação: ' + (error.message || 'Erro desconhecido'));
        }

        console.log('Transaction updated successfully:', data);
        toast({
          title: "Transação atualizada!",
          description: "A transação foi atualizada com sucesso.",
        });
      } else {
        console.log('Creating new transaction...');
        const { data, error } = await transactionOperations.create(transactionData);

        if (error) {
          console.error('Error creating transaction:', error);
          throw new Error('Erro ao criar transação: ' + (error.message || 'Erro desconhecido'));
        }

        console.log('Transaction created successfully:', data);
        toast({
          title: "Transação criada!",
          description: "A transação foi registrada com sucesso.",
        });
      }

      navigate('/transactions');
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a transação. Verifique os dados e tente novamente.",
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
