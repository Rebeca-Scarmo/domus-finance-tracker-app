
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import { TransactionFormFields } from '@/components/TransactionFormFields';
import { TransactionFormActions } from '@/components/TransactionFormActions';

export default function TransactionForm() {
  const {
    formData,
    setFormData,
    loading,
    isEditing,
    handleSubmit,
    navigate,
  } = useTransactionForm();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[#DDDDDD]">
          {isEditing ? 'Editar Transação' : 'Nova Transação'}
        </h1>
        <p className="text-[#7C7C7C] text-sm md:text-base">
          {isEditing ? 'Atualize os dados da transação' : 'Registre uma nova receita ou despesa'}
        </p>
      </div>

      {/* Form */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader>
          <CardTitle className="text-[#DDDDDD]">Dados da Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <TransactionFormFields formData={formData} setFormData={setFormData} />
            <TransactionFormActions 
              loading={loading} 
              isEditing={isEditing} 
              onCancel={() => navigate('/transactions')} 
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
