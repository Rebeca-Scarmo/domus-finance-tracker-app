
import { Button } from '@/components/ui/button';

interface TransactionFormActionsProps {
  loading: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export function TransactionFormActions({ loading, isEditing, onCancel }: TransactionFormActionsProps) {
  return (
    <div className="flex gap-4 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C]"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={loading}
        className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
      >
        {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
      </Button>
    </div>
  );
}
