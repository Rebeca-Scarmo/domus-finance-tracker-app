
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#DDDDDD]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#DDDDDD]">Transações</h1>
          <p className="text-[#7C7C7C] text-sm md:text-base">Gerencie suas receitas e despesas</p>
        </div>
        <Button
          onClick={() => navigate('/transactions/new')}
          className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 h-12 md:h-auto w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7C7C7C]" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7] h-12 md:h-auto"
              />
            </div>
            <Button 
              variant="outline" 
              className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C] h-12 md:h-auto w-full md:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader>
          <CardTitle className="text-[#DDDDDD]">
            Todas as Transações ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#7C7C7C] mb-4">
                {searchTerm ? 'Nenhuma transação encontrada' : 'Nenhuma transação registrada'}
              </p>
              <Button
                onClick={() => navigate('/transactions/new')}
                className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90 h-12 md:h-auto w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira transação
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#7C7C7C] hover:border-[#EEB3E7] transition-colors cursor-pointer"
                  onClick={() => navigate(`/transactions/${transaction.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: transaction.category?.color || '#7C7C7C' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#DDDDDD] truncate">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-[#7C7C7C]">
                          {transaction.category?.name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className={`font-bold text-base md:text-lg ${
                      transaction.type === 'income' ? 'text-[#EEB3E7]' : 'text-[#7C7C7C]'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {transaction.is_recurring && (
                      <p className="text-xs md:text-sm text-[#EEB3E7]">Recorrente</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
