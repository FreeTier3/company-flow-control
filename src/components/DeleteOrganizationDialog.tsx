
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Organization } from '@/types';

interface DeleteOrganizationDialogProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export default function DeleteOrganizationDialog({
  organization,
  isOpen,
  onClose,
  onDelete
}: DeleteOrganizationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!organization) return;

    setIsDeleting(true);
    try {
      await onDelete(organization.id);
      onClose();
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir a organização{' '}
            <span className="font-semibold">{organization?.name}</span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1"
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
