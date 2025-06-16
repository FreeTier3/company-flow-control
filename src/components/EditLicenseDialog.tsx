
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { License } from '@/types';

interface EditLicenseDialogProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<License>) => Promise<License>;
}

export default function EditLicenseDialog({ 
  license, 
  isOpen, 
  onClose, 
  onSave 
}: EditLicenseDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalSeats: 1,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (license) {
      setFormData({
        name: license.name,
        description: license.description || '',
        totalSeats: license.totalSeats,
      });
    }
  }, [license]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!license) return;
    
    setSaving(true);
    try {
      await onSave(license.id, {
        name: formData.name,
        description: formData.description || undefined,
        totalSeats: formData.totalSeats,
      });
      onClose();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Licença</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome da Licença *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da licença"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da licença"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-totalSeats">Total de Assentos *</Label>
            <Input
              id="edit-totalSeats"
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
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
