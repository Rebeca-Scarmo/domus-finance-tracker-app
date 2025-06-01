
// Local database types to supplement Supabase generated types
export interface DatabaseCategory {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface DatabaseTransaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
  is_recurring: boolean;
  recurrence_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  receipt_url?: string | null;
  created_at: string;
  updated_at: string;
}
