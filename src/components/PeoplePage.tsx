
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePeopleData } from '@/hooks/usePeopleData';
import { User, Plus, Edit, Trash2, Mail, Users, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditPersonDialog from '@/components/EditPersonDialog';
import DeletePersonDialog from '@/components/DeletePersonDialog';
import { Person } from '@/types';

export default function PeoplePage() {
  const navigate = useNavigate();
  const { people, teams, loading, addPerson, updatePerson, deletePerson } = usePeopleData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [deletePersonData, setDeletePersonData] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    position: '',
    reportsTo: '',
    teamId: '',
  });

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = filterTeam === 'all' || 
                       (filterTeam === 'no-team' && !person.teamId) ||
                       person.teamId === filterTeam;
    
    return matchesSearch && matchesTeam;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.position) {
      toast({
        title: "Erro",
        description: "Email, nome e cargo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPerson({
        ...formData,
        reportsTo: formData.reportsTo || undefined,
        teamId: formData.teamId || undefined,
        organizationId: '00000000-0000-0000-0000-000000000001',
      });

      setFormData({ email: '', name: '', position: '', reportsTo: '', teamId: '' });
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEdit = (person: Person) => {
    setEditPerson(person);
  };

  const handleDelete = (person: Person) => {
    setDeletePersonData(person);
  };

  const handleDeleteConfirm = async () => {
    if (deletePersonData) {
      await deletePerson(deletePersonData.id);
    }
  };

  const handleViewDetails = (person: Person) => {
    navigate(`/person/${person.id}`);
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    return team?.name;
  };

  const getSuperiorName = (reportsTo?: string) => {
    if (!reportsTo) return null;
    const superior = people.find(p => p.id === reportsTo);
    return superior?.name;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-500">Carregando pessoas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Pessoas</h1>
          <p className="text-gray-500 mt-2">Gerencie colaboradores da organização</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@empresa.com"
                />
              </div>
              
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Ex: Desenvolvedor, Gerente"
                />
              </div>
              
              <div>
                <Label htmlFor="team">Time</Label>
                <Select value={formData.teamId} onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um time (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum time</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reportsTo">Reporta para</Label>
                <Select value={formData.reportsTo} onValueChange={(value) => setFormData(prev => ({ ...prev, reportsTo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione superior (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum superior</SelectItem>
                    {people.map(person => (
                      <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Adicionar</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, email ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os times</SelectItem>
            <SelectItem value="no-team">Sem time</SelectItem>
            {teams.map(team => (
              <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* People List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPeople.map((person, index) => {
          const teamName = getTeamName(person.teamId);
          const superiorName = getSuperiorName(person.reportsTo);
          
          return (
            <Card key={person.id} className="corporate-card animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 rounded-full p-3">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(person)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-2">{person.position}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Mail className="h-4 w-4" />
                        <span>{person.email}</span>
                      </div>
                      <div className="flex gap-2">
                        {teamName && (
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {teamName}
                          </Badge>
                        )}
                        {superiorName && (
                          <Badge variant="outline">
                            Reporta para: {superiorName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(person)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(person)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPeople.length === 0 && people.length > 0 && (
        <Card className="corporate-card">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pessoa encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros de busca</p>
          </CardContent>
        </Card>
      )}

      {people.length === 0 && (
        <Card className="corporate-card">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pessoa cadastrada</h3>
            <p className="text-gray-500 mb-4">Comece adicionando colaboradores à organização</p>
            <Button onClick={() => setIsDialogOpen(true)} className="corporate-button">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Pessoa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Person Dialog */}
      <EditPersonDialog
        person={editPerson}
        isOpen={!!editPerson}
        onClose={() => setEditPerson(null)}
        onSave={updatePerson}
        teams={teams}
        people={people}
      />

      {/* Delete Person Dialog */}
      <DeletePersonDialog
        person={deletePersonData}
        isOpen={!!deletePersonData}
        onClose={() => setDeletePersonData(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
