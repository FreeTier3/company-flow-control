
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePeopleData } from '@/hooks/usePeopleData';
import { Person } from '@/types';
import { Users, User, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditPersonDialog from './EditPersonDialog';
import DeletePersonDialog from './DeletePersonDialog';

export default function PeoplePage() {
  const { people, teams, loading, addPerson, updatePerson, deletePerson } = usePeopleData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [adding, setAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    reportsTo: '',
    teamId: '',
  });

  const defaultOrganizationId = '00000000-0000-0000-0000-000000000001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.position) {
      toast({
        title: "Erro",
        description: "Nome, email e cargo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      await addPerson({
        ...formData,
        organizationId: defaultOrganizationId,
        reportsTo: formData.reportsTo || undefined,
        teamId: formData.teamId || undefined,
      });

      setFormData({
        name: '',
        email: '',
        position: '',
        reportsTo: '',
        teamId: '',
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (person: Person) => {
    setSelectedPerson(person);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (person: Person) => {
    setSelectedPerson(person);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPerson) {
      await deletePerson(selectedPerson.id);
    }
  };

  const getPersonName = (id: string) => {
    const person = people.find(p => p.id === id);
    return person ? person.name : 'N/A';
  };

  const getTeamName = (id: string) => {
    const team = teams.find(t => t.id === id);
    return team ? team.name : 'N/A';
  };

  const getSubordinates = (personId: string) => {
    return people.filter(p => p.reportsTo === personId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando pessoas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Pessoas</h1>
          <p className="text-gray-500 mt-2">Gerencie funcionários e hierarquia organizacional</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="corporate-button">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pessoa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Pessoa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@empresa.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Desenvolvedor, Gerente, etc."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reportsTo">Reporta para</Label>
                <Select value={formData.reportsTo} onValueChange={(value) => setFormData(prev => ({ ...prev, reportsTo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o superior" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} - {person.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="team">Time</Label>
                <Select value={formData.teamId} onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o time" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={adding}>
                  {adding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    'Adicionar'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={adding}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* People List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person, index) => (
          <Card key={person.id} className="corporate-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary rounded-full p-2">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{person.name}</h3>
                    <p className="text-sm text-gray-500 font-normal">{person.position}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(person)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(person)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-sm">{person.email}</p>
                </div>
                
                {person.reportsTo && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Reporta para:</span>
                    <p className="text-sm">{getPersonName(person.reportsTo)}</p>
                  </div>
                )}
                
                {person.teamId && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Time:</span>
                    <p className="text-sm">{getTeamName(person.teamId)}</p>
                  </div>
                )}
                
                {getSubordinates(person.id).length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Subordinados:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{getSubordinates(person.id).length} pessoa(s)</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {people.length === 0 && (
        <Card className="corporate-card">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pessoa cadastrada</h3>
            <p className="text-gray-500 mb-4">Comece adicionando pessoas à sua organização</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="corporate-button">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Pessoa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <EditPersonDialog
        person={selectedPerson}
        people={people}
        teams={teams}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedPerson(null);
        }}
        onSave={updatePerson}
      />

      {/* Delete Dialog */}
      <DeletePersonDialog
        person={selectedPerson}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPerson(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
