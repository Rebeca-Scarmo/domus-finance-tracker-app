
-- Create table for goal contributions
CREATE TABLE public.goal_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- Create policy for goal contributions - users can only see contributions for their own goals
CREATE POLICY "Users can view their own goal contributions" 
  ON public.goal_contributions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = goal_contributions.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Create policy for inserting goal contributions
CREATE POLICY "Users can create contributions for their own goals" 
  ON public.goal_contributions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = goal_contributions.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Create policy for updating goal contributions
CREATE POLICY "Users can update their own goal contributions" 
  ON public.goal_contributions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = goal_contributions.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Create policy for deleting goal contributions
CREATE POLICY "Users can delete their own goal contributions" 
  ON public.goal_contributions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE goals.id = goal_contributions.goal_id 
      AND goals.user_id = auth.uid()
    )
  );
