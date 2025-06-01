
import { createClient } from '@supabase/supabase-js';
import { DatabaseTransaction } from '@/types/database';

const SUPABASE_URL = "https://rzljgsegmfbzsjphbppf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bGpnc2VnbWZienNqcGhicHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTYxNjUsImV4cCI6MjA2Mzc3MjE2NX0.c4Pvq10WWJaD2QD6Rpeuf6ciLtEAUwbmRfa25G84m8Y";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Transaction operations
export const transactionOperations = {
  async getAll() {
    console.log('Getting all transactions...');
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      console.log('Transactions fetched successfully:', data);
      return { data: data as DatabaseTransaction[], error: null };
    } catch (error) {
      console.error('Error in getAll:', error);
      return { data: null, error };
    }
  },

  async getById(id: string) {
    console.log('Getting transaction by id:', id);
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching transaction:', error);
        throw error;
      }

      console.log('Transaction fetched successfully:', data);
      return { data: data as DatabaseTransaction, error: null };
    } catch (error) {
      console.error('Error in getById:', error);
      return { data: null, error };
    }
  },

  async create(transaction: Omit<DatabaseTransaction, 'id' | 'created_at' | 'updated_at'>) {
    console.log('Creating transaction:', transaction);
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      // Ensure user_id matches authenticated user
      const transactionWithUserId = {
        ...transaction,
        user_id: user.id
      };

      const { data, error } = await supabaseClient
        .from('transactions')
        .insert([transactionWithUserId])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }

      console.log('Transaction created successfully:', data);
      return { data: data as DatabaseTransaction, error: null };
    } catch (error) {
      console.error('Error in create:', error);
      return { data: null, error };
    }
  },

  async update(id: string, updates: Partial<Omit<DatabaseTransaction, 'id' | 'created_at' | 'updated_at'>>) {
    console.log('Updating transaction:', id, updates);
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabaseClient
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }

      console.log('Transaction updated successfully:', data);
      return { data: data as DatabaseTransaction, error: null };
    } catch (error) {
      console.error('Error in update:', error);
      return { data: null, error };
    }
  },

  async delete(id: string) {
    console.log('Deleting transaction:', id);
    
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      const { error } = await supabaseClient
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error deleting transaction:', error);
        throw error;
      }

      console.log('Transaction deleted successfully');
      return { error: null };
    } catch (error) {
      console.error('Error in delete:', error);
      return { error };
    }
  }
};
