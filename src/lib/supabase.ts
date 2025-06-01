
import { createClient } from '@supabase/supabase-js';
import { DatabaseTransaction } from '@/types/database';

const SUPABASE_URL = "https://rzljgsegmfbzsjphbppf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bGpnc2VnbWZienNqcGhicHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTYxNjUsImV4cCI6MjA2Mzc3MjE2NX0.c4Pvq10WWJaD2QD6Rpeuf6ciLtEAUwbmRfa25G84m8Y";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Transaction operations
export const transactionOperations = {
  async getAll() {
    const { data, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    return { data: data as DatabaseTransaction[], error };
  },

  async getById(id: string) {
    const { data, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data: data as DatabaseTransaction, error };
  },

  async create(transaction: Omit<DatabaseTransaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseClient
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    
    return { data: data as DatabaseTransaction, error };
  },

  async update(id: string, updates: Partial<Omit<DatabaseTransaction, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabaseClient
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data: data as DatabaseTransaction, error };
  },

  async delete(id: string) {
    const { error } = await supabaseClient
      .from('transactions')
      .delete()
      .eq('id', id);
    
    return { error };
  }
};
