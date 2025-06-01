
import { createClient } from '@supabase/supabase-js';
import { DatabaseTransaction } from '@/types/database';

const SUPABASE_URL = "https://rzljgsegmfbzsjphbppf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bGpnc2VnbWZienNqcGhicHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTYxNjUsImV4cCI6MjA2Mzc3MjE2NX0.c4Pvq10WWJaD2QD6Rpeuf6ciLtEAUwbmRfa25G84m8Y";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Transaction operations
export const transactionOperations = {
  async getAll() {
    console.log('=== BUSCANDO TODAS AS TRANSAÇÕES ===');
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError) {
        console.error('Erro de autenticação:', userError);
        return { data: null, error: userError };
      }

      if (!user) {
        console.error('Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      console.log('Buscando transações para o usuário:', user.id);

      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar transações:', error);
        return { data: null, error };
      }

      console.log('Transações encontradas:', data?.length || 0);
      return { data: data as DatabaseTransaction[], error: null };
    } catch (error) {
      console.error('Erro inesperado em getAll:', error);
      return { data: null, error };
    }
  },

  async getById(id: string) {
    console.log('=== BUSCANDO TRANSAÇÃO POR ID ===', id);
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError) {
        console.error('Erro de autenticação:', userError);
        return { data: null, error: userError };
      }

      if (!user) {
        console.error('Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar transação:', error);
        return { data: null, error };
      }

      console.log('Transação encontrada:', data);
      return { data: data as DatabaseTransaction, error: null };
    } catch (error) {
      console.error('Erro inesperado em getById:', error);
      return { data: null, error };
    }
  },

  async create(transaction: Omit<DatabaseTransaction, 'id' | 'created_at' | 'updated_at'>) {
    console.log('=== CRIANDO NOVA TRANSAÇÃO ===');
    console.log('Dados recebidos:', transaction);
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError) {
        console.error('Erro de autenticação:', userError);
        return { data: null, error: userError };
      }

      if (!user) {
        console.error('Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      // Garantir que o user_id está correto
      const transactionWithUserId = {
        ...transaction,
        user_id: user.id
      };

      console.log('Inserindo no Supabase:', transactionWithUserId);

      const { data, error } = await supabaseClient
        .from('transactions')
        .insert([transactionWithUserId])
        .select()
        .single();
      
      if (error) {
        console.error('Erro do Supabase ao criar:', error);
        return { data: null, error };
      }

      console.log('Transação criada com sucesso:', data);
      return { data: data as DatabaseTransaction, error: null };
    } catch (error) {
      console.error('Erro inesperado em create:', error);
      return { data: null, error };
    }
  },

  async update(id: string, updates: Partial<Omit<DatabaseTransaction, 'id' | 'created_at' | 'updated_at'>>) {
    console.log('=== ATUALIZANDO TRANSAÇÃO ===');
    console.log('ID:', id);
    console.log('Atualizações:', updates);
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError) {
        console.error('Erro de autenticação:', userError);
        return { data: null, error: userError };
      }

      if (!user) {
        console.error('Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      const { data, error } = await supabaseClient
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro do Supabase ao atualizar:', error);
        return { data: null, error };
      }

      console.log('Transação atualizada com sucesso:', data);
      return { data: data as DatabaseTransaction, error: null };
    } catch (error) {
      console.error('Erro inesperado em update:', error);
      return { data: null, error };
    }
  },

  async delete(id: string) {
    console.log('=== DELETANDO TRANSAÇÃO ===', id);
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError) {
        console.error('Erro de autenticação:', userError);
        return { error: userError };
      }

      if (!user) {
        console.error('Usuário não autenticado');
        return { error: new Error('Usuário não autenticado') };
      }

      const { error } = await supabaseClient
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro do Supabase ao deletar:', error);
        return { error };
      }

      console.log('Transação deletada com sucesso');
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado em delete:', error);
      return { error };
    }
  }
};
