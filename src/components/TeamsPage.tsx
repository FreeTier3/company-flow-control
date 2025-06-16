
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTeamsData } from '@/hooks/useTeamsData';
import { usePeopleData } from '@/hooks/usePeopleData';
import { User, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import EditTeamDialog from '@/components/EditTeamDialog';
import DeleteTeamDialog from '@/components/DeleteTeamDialog';
import { Team } from '@/types';

export default function TeamsPage() {
  const { teams, loading, addTeam, updateTeam, deleteTeam } = useTeamsData();
  const { people } = usePeopleData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeamData, setDeleteTeamData] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "Nome do time é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTeam({
        ...formData,
        organizationId: '00000000-0000-0000-0000-000000000001',
      });

      setFormData({ name: '', description: '' });
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEdit = (team: Team) => {
    setEditTeam(team);
  };

  const handleDelete = (team: Team) => {
    setDeleteTeamData(team);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTeamData) {
      await deleteTeam(deleteTeamData.id);
    }
  };

  const getTeamMembers = (teamId: string) => {
    return people.filter(person => person.teamId === teamId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-500">Carregando times...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Times</h1>
          <p className="text-gray-500 mt-2">Organize pessoas em times de trabalho</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="corporate-button">
              <Plus className="h-4 w-4 mr-2" />
              Criar Time
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Time</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Time *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Desenvolvimento, Marketing"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional do time"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Criar</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, index) => {
          const members = getTeamMembers(team.id);
          return (
            <Card key={team.id} className="corporate-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-500 rounded-full p-2">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm text-gray-500 font-normal">{members.length} membro(s)</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(team)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(team)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.description && (
                    <p className="text-sm text-gray-600">{team.description}</p>
                  )}
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">Membros:</span>
                    {members.length === 0 ? (
                      <p className="text-sm text-gray-400 mt-1">Nenhum membro</p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {members.slice(0, 3).map(member => (
                          <div key={member.id} className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{member.name}</span>
                          </div>
                        ))}
                        {members.length > 3 && (
                          <p className="text-xs text-gray-400">+{members.length - 3} outros</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {teams.length === 0 && (
        <Card className="corporate-card">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum time criado</h3>
            <p className="text-gray-500 mb-4">Organize sua empresa criando times de trabalho</p>
            <Button onClick={() => setIsDialogOpen(true)} className="corporate-button">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Time
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Team Dialog */}
      <EditTeamDialog
        team={editTeam}
        isOpen={!!editTeam}
        onClose={() => setEditTeam(null)}
        onSave={updateTeam}
      />

      {/* Delete Team Dialog */}
      <DeleteTeamDialog
        team={deleteTeamData}
        isOpen={!!deleteTeamData}
        onClose={() => setDeleteTeamData(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
