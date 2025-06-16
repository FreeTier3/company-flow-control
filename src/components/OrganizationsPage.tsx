
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Trash2, RotateCcw } from 'lucide-react';
import { useOrganizationsData } from '@/hooks/useOrganizationsData';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { Organization } from '@/types';
import AddOrganizationDialog from './AddOrganizationDialog';
import EditOrganizationDialog from './EditOrganizationDialog';
import DeleteOrganizationDialog from './DeleteOrganizationDialog';

export default function OrganizationsPage() {
  const {
    organizations,
    loading: organizationsLoading,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    refreshData
  } = useOrganizationsData();

  const {
    currentOrganization,
    loading: currentOrgLoading,
    switchOrganization
  } = useCurrentOrganization();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  const handleEdit = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsDeleteDialogOpen(true);
  };

  const handleSwitchOrganization = async (orgId: string) => {
    console.log('Switching to organization:', orgId);
    await switchOrganization(orgId);
  };

  const handleCreateOrganization = async (orgData: { name: string }) => {
    const newOrg = await createOrganization(orgData);
    await refreshData();
    return newOrg;
  };

  const handleUpdateOrganization = async (id: string, updates: { name: string }) => {
    const updatedOrg = await updateOrganization(id, updates);
    await refreshData();
    return updatedOrg;
  };

  const handleDeleteOrganization = async (id: string) => {
    await deleteOrganization(id);
    await refreshData();
  };

  const loading = organizationsLoading || currentOrgLoading;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizações</h1>
          <p className="text-gray-600 mt-1">Gerencie suas organizações e alterne entre elas</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Organização
        </Button>
      </div>

      {/* Current Organization */}
      {currentOrganization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organização Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{currentOrganization.name}</h3>
                <p className="text-sm text-gray-500">
                  Criada em {currentOrganization.createdAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Badge variant="secondary">Ativa</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Organizações</CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma organização encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead>Atualizada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((organization) => (
                  <TableRow key={organization.id}>
                    <TableCell className="font-medium">{organization.name}</TableCell>
                    <TableCell>
                      {currentOrganization?.id === organization.id ? (
                        <Badge variant="default">Ativa</Badge>
                      ) : (
                        <Badge variant="outline">Inativa</Badge>
                      )}
                    </TableCell>
                    <TableCell>{organization.createdAt.toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{organization.updatedAt.toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {currentOrganization?.id !== organization.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSwitchOrganization(organization.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Alternar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(organization)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(organization)}
                          disabled={currentOrganization?.id === organization.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddOrganizationDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleCreateOrganization}
      />

      <EditOrganizationDialog
        organization={selectedOrganization}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedOrganization(null);
        }}
        onUpdate={handleUpdateOrganization}
      />

      <DeleteOrganizationDialog
        organization={selectedOrganization}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedOrganization(null);
        }}
        onDelete={handleDeleteOrganization}
      />
    </div>
  );
}
