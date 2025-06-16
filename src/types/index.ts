
export interface User {
  id: string;
  full_name: string;
  email: string;
  currency: string;
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
}

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  currency: string;
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  is_default: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
  is_recurring: boolean;
  recurrence_type?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receipt_url?: string;
  category?: Category;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  is_completed: boolean;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  amount: number;
  description?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  is_recurring: boolean;
  category?: Category;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'freemium' | 'premium';
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date?: string;
}
