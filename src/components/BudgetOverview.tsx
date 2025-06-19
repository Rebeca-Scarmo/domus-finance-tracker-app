
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface BudgetOverviewData {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
  color: string;
  percentage: number;
  period: string;
}

export function BudgetOverview() {
  const [budgets, setBudgets] = useState<BudgetOverviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgetsWithSpending();
  }, []);

  const loadBudgetsWithSpending = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Carregar orçamentos com suas categorias
      const { data: budgets } = await supabase
        .from('budgets')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Carregar transações do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      console.log('Orçamentos carregados:', budgets);
      console.log('Transações do mês:', transactions);

      if (budgets && transactions) {
        // Criar mapa de gastos por categoria
        const spentByCategory = new Map<string, number>();
        
        transactions.forEach((transaction) => {
          if (transaction.category_id) {
            const currentSpent = spentByCategory.get(transaction.category_id) || 0;
            spentByCategory.set(transaction.category_id, currentSpent + parseFloat(transaction.amount));
          }
        });

        // Processar orçamentos com gastos
        const budgetOverview = budgets.map((budget) => {
          const spent = spentByCategory.get(budget.category_id) || 0;
          const budgeted = parseFloat(budget.amount);
          const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;

          return {
            id: budget.id,
            category: budget.categories?.name || 'Categoria Desconhecida',
            budgeted,
            spent,
            color: budget.categories?.color || '#7C7C7C',
            percentage,
            period: budget.period
          };
        });

        console.log('Visão geral dos orçamentos:', budgetOverview);
        setBudgets(budgetOverview);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-[#DDDDDD] text-sm">Carregando orçamentos...</div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardContent className="p-4">
          <p className="text-[#7C7C7C] text-center">Nenhum orçamento criado ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#DDDDDD]">Visão Geral dos Orçamentos</h2>
        <p className="text-[#7C7C7C] text-sm">Acompanhe seus gastos vs orçamento planejado</p>
      </div>

      <div className="grid gap-4">
        {budgets.map((budget) => {
          const isOverBudget = budget.percentage > 100;
          const remaining = budget.budgeted - budget.spent;
          
          return (
            <Card key={budget.id} className="bg-[#000000] border-[#7C7C7C]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#DDDDDD] text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    {budget.category}
                  </div>
                  <div className="flex items-center gap-1">
                    {isOverBudget ? (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    ) : budget.percentage > 80 ? (
                      <TrendingUp className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-[#EEB3E7]" />
                    )}
                    <span className={`text-sm ${isOverBudget ? 'text-red-400' : 'text-[#EEB3E7]'}`}>
                      {budget.percentage.toFixed(1)}%
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="w-full bg-[#7C7C7C]/30 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-400' : budget.percentage > 80 ? 'bg-yellow-400' : 'bg-[#EEB3E7]'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#7C7C7C]">Gasto</p>
                      <p className="text-[#DDDDDD] font-medium">
                        R$ {budget.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#7C7C7C]">Orçamento</p>
                      <p className="text-[#DDDDDD] font-medium">
                        R$ {budget.budgeted.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#7C7C7C]/30">
                    {remaining >= 0 ? (
                      <p className="text-[#EEB3E7] text-sm">
                        Disponível: R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    ) : (
                      <p className="text-red-400 text-sm">
                        Excedido em: R$ {Math.abs(remaining).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
