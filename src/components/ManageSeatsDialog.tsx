import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { License, Seat, Person } from '@/types';
import { usePeopleData } from '@/hooks/usePeopleData';

interface ManageSeatsDialogProps {
  license: License | null;
  seats: Seat[];
  isOpen: boolean;
  onClose: () => void;
  onAssignSeat: (seatId: string, personId: string, newCode?: string) => Promise<Seat>;
  onUnassignSeat: (seatId: string) => Promise<Seat>;
}

export default function ManageSeatsDialog({ 
  license, 
  seats,
  isOpen, 
  onClose, 
  onAssignSeat,
  onUnassignSeat
}: ManageSeatsDialogProps) {
  const { people } = usePeopleData();
  const [licenseSeats, setLicenseSeats] = useState<Seat[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<string>('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  
  const seatsPerPage = 10;

  useEffect(() => {
    if (license) {
      const filteredSeats = seats.filter(seat => seat.licenseId === license.id);
      setLicenseSeats(filteredSeats);
    }
  }, [license, seats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [licenseSeats]);

  const totalPages = Math.ceil(licenseSeats.length / seatsPerPage);
  const startIndex = (currentPage - 1) * seatsPerPage;
  const endIndex = startIndex + seatsPerPage;
  const currentSeats = licenseSeats.slice(startIndex, endIndex);

  const handleAssignSeat = async (seatId: string, personId: string, newCode?: string) => {
    try {
      await onAssignSeat(seatId, personId, newCode);
      setAssigningTo(null);
      setEditingCode('');
      setSelectedPersonId('');
    } catch (error) {
      // Error is handled in the parent component
    }
  };

  const handleUnassignSeat = async (seatId: string) => {
    try {
      await onUnassignSeat(seatId);
    } catch (error) {
      // Error is handled in the parent component
    }
  };

  const getPersonName = (personId: string | undefined) => {
    if (!personId) return 'Não atribuído';
    const person = people.find(p => p.id === personId);
    return person ? person.name : 'Pessoa não encontrada';
  };

  const getAvailablePeople = (currentPersonId?: string) => {
    const assignedPersonIds = licenseSeats
      .filter(seat => seat.personId && seat.personId !== currentPersonId)
      .map(seat => seat.personId);
    
    return people.filter(person => !assignedPersonIds.includes(person.id));
  };

  const startAssignment = (seatId: string, currentCode?: string) => {
    setAssigningTo(seatId);
    setEditingCode(currentCode || '');
    setSelectedPersonId('');
  };

  const cancelAssignment = () => {
    setAssigningTo(null);
    setEditingCode('');
    setSelectedPersonId('');
  };

  const confirmAssignment = () => {
    if (assigningTo && selectedPersonId) {
      handleAssignSeat(assigningTo, selectedPersonId, editingCode);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, 5);
        } else if (currentPage >= totalPages - 2) {
          pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
        }
      }
      
      return pages;
    };

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {getVisiblePages().map((page, index, array) => (
            <PaginationItem key={page}>
              {index > 0 && array[index - 1] !== page - 1 && (
                <PaginationEllipsis />
              )}
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (!license) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Assentos - {license.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Total de assentos: {license.totalSeats} | 
            Atribuídos: {licenseSeats.filter(seat => seat.personId).length} | 
            Disponíveis: {licenseSeats.filter(seat => !seat.personId).length}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Pessoa Atribuída</TableHead>
                <TableHead>Data de Atribuição</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSeats.map((seat) => (
                <TableRow key={seat.id}>
                  <TableCell className="font-medium">{seat.code}</TableCell>
                  <TableCell>{getPersonName(seat.personId)}</TableCell>
                  <TableCell>
                    {seat.assignedAt ? seat.assignedAt.toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {seat.personId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassignSeat(seat.id)}
                        >
                          Liberar
                        </Button>
                      ) : assigningTo === seat.id ? (
                        <div className="flex flex-col gap-2 min-w-64">
                          <div>
                            <Label htmlFor="seat-code" className="text-xs">Código do Assento (opcional)</Label>
                            <Input
                              id="seat-code"
                              value={editingCode}
                              onChange={(e) => setEditingCode(e.target.value)}
                              placeholder="Código personalizado"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="person-select" className="text-xs">Selecionar Pessoa</Label>
                            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Selecionar pessoa" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailablePeople().map((person) => (
                                  <SelectItem key={person.id} value={person.id}>
                                    {person.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={confirmAssignment}
                              disabled={!selectedPersonId}
                              className="h-8 px-2 text-xs"
                            >
                              Confirmar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelAssignment}
                              className="h-8 px-2 text-xs"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startAssignment(seat.id, seat.code)}
                        >
                          Atribuir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {renderPagination()}
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
