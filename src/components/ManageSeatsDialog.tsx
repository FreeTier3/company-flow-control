
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { License, Seat, Person } from '@/types';
import { usePeopleData } from '@/hooks/usePeopleData';

interface ManageSeatsDialogProps {
  license: License | null;
  seats: Seat[];
  isOpen: boolean;
  onClose: () => void;
  onAssignSeat: (seatId: string, personId: string) => Promise<Seat>;
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

  useEffect(() => {
    if (license) {
      const filteredSeats = seats.filter(seat => seat.licenseId === license.id);
      setLicenseSeats(filteredSeats);
    }
  }, [license, seats]);

  const handleAssignSeat = async (seatId: string, personId: string) => {
    try {
      await onAssignSeat(seatId, personId);
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

  if (!license) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
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
              {licenseSeats.map((seat) => (
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
                      ) : (
                        <Select
                          onValueChange={(personId) => handleAssignSeat(seat.id, personId)}
                        >
                          <SelectTrigger className="w-48">
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
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
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
