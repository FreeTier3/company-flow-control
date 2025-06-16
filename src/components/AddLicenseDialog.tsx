
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { License } from '@/types';

interface AddLicenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (licenseData: Omit<License, 'id' | 'createdAt' | 'updatedAt'>) => Promise<License>;
}

export default function AddLicenseDialog({ 
  isOpen, 
  onClose, 
  onSave 
}: AddLicenseDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalSeats: 1,
  });
  const [saving, setSaving] = useState(false);

  const defaultOrganizationId = '00000000-0000-0000-0000-000000000001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      await onSave({
        name: formData.name,
        description: formData.description || undefined,
        totalSeats: formData.totalSeats,
        organizationId: defaultOrganizationId,
      });
      
      setFormData({ name: '', description: '', totalSeats: 1 });
      onClose();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', totalSeats: 1 });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Licença</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Licença *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da licença"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da licença"
            />
          </div>
          
          <div>
            <Label htmlFor="totalSeats">Total de Assentos *</Label>
            <Input
              id="totalSeats"
              type="number"
              min="1"
              value={formData.totalSeats}
              onChange={(e) => setFormData(prev => ({ ...prev, totalSeats: parseInt(e.target.value) || 1 }))}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
