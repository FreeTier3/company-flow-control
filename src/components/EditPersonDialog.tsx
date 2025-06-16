
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Person, Team } from '@/types';

interface EditPersonDialogProps {
  person: Person | null;
  people: Person[];
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Person>) => Promise<void>;
}

export default function EditPersonDialog({ 
  person, 
  people, 
  teams, 
  isOpen, 
  onClose, 
  onSave 
}: EditPersonDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    reportsTo: '',
    teamId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name,
        email: person.email,
        position: person.position,
        reportsTo: person.reportsTo || '',
        teamId: person.teamId || '',
      });
    }
  }, [person]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person) return;
    
    setSaving(true);
    try {
      await onSave(person.id, {
        name: formData.name,
        email: formData.email,
        position: formData.position,
        reportsTo: formData.reportsTo || undefined,
        teamId: formData.teamId || undefined,
      });
      onClose();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setSaving(false);
    }
  };

  const availableSuperiors = people.filter(p => p.id !== person?.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Pessoa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@empresa.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edit-position">Cargo *</Label>
            <Input
              id="edit-position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Desenvolvedor, Gerente, etc."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edit-reportsTo">Reporta para</Label>
            <Select value={formData.reportsTo} onValueChange={(value) => setFormData(prev => ({ ...prev, reportsTo: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o superior" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {availableSuperiors.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} - {person.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="edit-team">Time</Label>
            <Select value={formData.teamId} onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
