import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Book, BookCheck } from 'lucide-react';
import { useLicensesData } from '@/hooks/useLicensesData';
import { License } from '@/types';
import AddLicenseDialog from './AddLicenseDialog';
import EditLicenseDialog from './EditLicenseDialog';
import DeleteLicenseDialog from './DeleteLicenseDialog';
import ManageSeatsDialog from './ManageSeatsDialog';

export default function LicensesPage() {
  const { 
    licenses, 
    seats, 
    loading, 
    addLicense, 
    updateLicense, 
    deleteLicense,
    assignSeat,
    unassignSeat
  } = useLicensesData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [deletingLicense, setDeletingLicense] = useState<License | null>(null);
  const [managingSeatsLicense, setManagingSeatsLicense] = useState<License | null>(null);

  const filteredLicenses = licenses.filter(license =>
    license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (license.description && license.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSeatsStats = (licenseId: string) => {
    const licenseSeats = seats.filter(seat => seat.licenseId === licenseId);
    const assigned = licenseSeats.filter(seat => seat.personId).length;
    const total = licenseSeats.length;
    const available = total - assigned;
    
    return { assigned, available, total };
  };

  const handleEditLicense = (license: License) => {
    setEditingLicense(license);
  };

  const handleDeleteLicense = (license: License) => {
    setDeletingLicense(license);
  };

  const handleManageSeats = (license: License) => {
    setManagingSeatsLicense(license);
  };

  const confirmDeleteLicense = async () => {
    if (deletingLicense) {
      await deleteLicense(deletingLicense.id);
    }
  };

  const handleAssignSeat = async (seatId: string, personId: string, newCode?: string) => {
    return await assignSeat(seatId, personId, newCode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando licenças...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Licenças</h1>
          <p className="text-muted-foreground">
            Gerencie as licenças de software e suas atribuições
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Licença
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Licenças</CardTitle>
          <CardDescription>
            Visão geral das licenças e seus assentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{licenses.length}</div>
              <div className="text-sm text-muted-foreground">Total de Licenças</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {seats.filter(seat => seat.personId).length}
              </div>
              <div className="text-sm text-muted-foreground">Assentos Atribuídos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {seats.filter(seat => !seat.personId).length}
              </div>
              <div className="text-sm text-muted-foreground">Assentos Disponíveis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Licenças</CardTitle>
              <CardDescription>
                {filteredLicenses.length} licença(s) encontrada(s)
              </CardDescription>
            </div>
            <div className="w-72">
              <Input
                placeholder="Buscar licenças..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Assentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((license) => {
                const stats = getSeatsStats(license.id);
                return (
                  <TableRow key={license.id}>
                    <TableCell className="font-medium">{license.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {license.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm">
                          {stats.assigned}/{stats.total} atribuídos
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(stats.assigned / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {stats.available > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <BookCheck className="mr-1 h-3 w-3" />
                          Disponível
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <Book className="mr-1 h-3 w-3" />
                          Completo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{license.createdAt.toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageSeats(license)}
                        >
                          Assentos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditLicense(license)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLicense(license)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredLicenses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhuma licença encontrada para o termo buscado.' : 'Nenhuma licença cadastrada ainda.'}
            </div>
          )}
        </CardContent>
      </Card>

      <AddLicenseDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={addLicense}
      />

      <EditLicenseDialog
        license={editingLicense}
        isOpen={!!editingLicense}
        onClose={() => setEditingLicense(null)}
        onSave={updateLicense}
      />

      <DeleteLicenseDialog
        license={deletingLicense}
        isOpen={!!deletingLicense}
        onClose={() => setDeletingLicense(null)}
        onConfirm={confirmDeleteLicense}
      />

      <ManageSeatsDialog
        license={managingSeatsLicense}
        seats={seats}
        isOpen={!!managingSeatsLicense}
        onClose={() => setManagingSeatsLicense(null)}
        onAssignSeat={handleAssignSeat}
        onUnassignSeat={unassignSeat}
      />
    </div>
  );
}
