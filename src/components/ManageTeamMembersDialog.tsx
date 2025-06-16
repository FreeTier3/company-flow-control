
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Team, Person } from '@/types';
import { User, X, Plus, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ManageTeamMembersDialogProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  onUpdatePerson: (id: string, updates: Partial<Person>) => Promise<Person>;
}

export default function ManageTeamMembersDialog({
  team,
  isOpen,
  onClose,
  people,
  onUpdatePerson
}: ManageTeamMembersDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const { toast } = useToast();

  const teamMembers = people.filter(person => person.teamId === team?.id);
  const availablePeople = people.filter(person => !person.teamId && person.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddMember = async () => {
    if (!selectedPersonId || !team) return;

    try {
      await onUpdatePerson(selectedPersonId, { teamId: team.id });
      setSelectedPersonId('');
      toast({
        title: "Sucesso",
        description: "Membro adicionado ao time",
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRemoveMember = async (personId: string) => {
    try {
      await onUpdatePerson(personId, { teamId: undefined });
      toast({
        title: "Sucesso",
        description: "Membro removido do time",
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedPersonId('');
    }
  }, [isOpen]);

  if (!team) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros - {team.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Member Section */}
          <div className="space-y-3">
            <Label>Adicionar Membro</Label>
            <div className="flex gap-2">
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma pessoa" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} - {person.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddMember} 
                disabled={!selectedPersonId}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Current Members */}
          <div className="space-y-3">
            <Label>Membros Atuais ({teamMembers.length})</Label>
            
            {teamMembers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhum membro no time</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {teamMembers.map(member => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500 rounded-full p-2">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-gray-500">{member.position}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
