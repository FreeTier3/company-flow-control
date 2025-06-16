import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { License, Seat } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';

export interface DatabaseLicense {
  id: string;
  name: string;
  description: string | null;
  total_seats: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSeat {
  id: string;
  license_id: string;
  code: string | null;
  person_id: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useLicensesData() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useCurrentOrganization();

  const mapDatabaseLicenseToLicense = (dbLicense: DatabaseLicense): License => ({
    id: dbLicense.id,
    name: dbLicense.name,
    description: dbLicense.description || undefined,
    totalSeats: dbLicense.total_seats,
    organizationId: dbLicense.organization_id,
    createdAt: new Date(dbLicense.created_at),
    updatedAt: new Date(dbLicense.updated_at)
  });

  const mapDatabaseSeatToSeat = (dbSeat: DatabaseSeat): Seat => ({
    id: dbSeat.id,
    licenseId: dbSeat.license_id,
    code: dbSeat.code || undefined,
    personId: dbSeat.person_id || undefined,
    assignedAt: dbSeat.assigned_at ? new Date(dbSeat.assigned_at) : undefined,
    createdAt: new Date(dbSeat.created_at),
    updatedAt: new Date(dbSeat.updated_at)
  });

  const fetchLicenses = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      console.log('Licenses: Fetching for organization:', currentOrganization.id);
      
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (error) throw error;

      const mappedLicenses = data.map(mapDatabaseLicenseToLicense);
      console.log('Licenses: Fetched licenses:', mappedLicenses.length);
      setLicenses(mappedLicenses);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar licenças",
        variant: "destructive",
      });
    }
  };

  const fetchSeats = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      console.log('Seats: Fetching for organization:', currentOrganization.id);
      
      // Buscar apenas assentos das licenças da organização atual
      const { data, error } = await supabase
        .from('seats')
        .select(`
          *,
          licenses!inner(organization_id)
        `)
        .eq('licenses.organization_id', currentOrganization.id)
        .order('created_at');

      if (error) throw error;

      const mappedSeats = data.map(seat => mapDatabaseSeatToSeat({
        id: seat.id,
        license_id: seat.license_id,
        code: seat.code,
        person_id: seat.person_id,
        assigned_at: seat.assigned_at,
        created_at: seat.created_at,
        updated_at: seat.updated_at
      }));
      console.log('Seats: Fetched seats:', mappedSeats.length);
      setSeats(mappedSeats);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar assentos",
        variant: "destructive",
      });
    }
  };

  const addLicense = async (licenseData: Omit<License, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: licenseResult, error: licenseError } = await supabase
        .from('licenses')
        .insert({
          name: licenseData.name,
          description: licenseData.description || null,
          total_seats: licenseData.totalSeats,
          organization_id: licenseData.organizationId
        })
        .select()
        .single();

      if (licenseError) throw licenseError;

      const newLicense = mapDatabaseLicenseToLicense(licenseResult);

      // Criar assentos automaticamente
      const seatsToCreate = Array.from({ length: licenseData.totalSeats }, (_, index) => ({
        license_id: newLicense.id,
        code: `${licenseData.name}-${String(index + 1).padStart(3, '0')}`
      }));

      const { error: seatsError } = await supabase
        .from('seats')
        .insert(seatsToCreate);

      if (seatsError) throw seatsError;

      setLicenses(prev => [newLicense, ...prev]);
      await fetchSeats(); // Recarregar assentos
      
      toast({
        title: "Sucesso",
        description: "Licença adicionada com sucesso",
      });

      return newLicense;
    } catch (error: any) {
      console.error('Error adding license:', error);
      
      let errorMessage = "Falha ao adicionar licença";
      if (error.code === '23505') {
        errorMessage = "Este nome de licença já está sendo usado";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateLicense = async (id: string, updates: Partial<License>) => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .update({
          ...(updates.name && { name: updates.name }),
          description: updates.description || null,
          ...(updates.totalSeats && { total_seats: updates.totalSeats }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedLicense = mapDatabaseLicenseToLicense(data);
      setLicenses(prev => prev.map(license => license.id === id ? updatedLicense : license));
      
      toast({
        title: "Sucesso",
        description: "Licença atualizada com sucesso",
      });

      return updatedLicense;
    } catch (error: any) {
      console.error('Error updating license:', error);
      
      let errorMessage = "Falha ao atualizar licença";
      if (error.code === '23505') {
        errorMessage = "Este nome de licença já está sendo usado";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteLicense = async (id: string) => {
    try {
      // Primeiro deletar os assentos
      const { error: seatsError } = await supabase
        .from('seats')
        .delete()
        .eq('license_id', id);

      if (seatsError) throw seatsError;

      // Depois deletar a licença
      const { error } = await supabase
        .from('licenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLicenses(prev => prev.filter(license => license.id !== id));
      setSeats(prev => prev.filter(seat => seat.licenseId !== id));
      
      toast({
        title: "Sucesso",
        description: "Licença removida com sucesso",
      });
    } catch (error) {
      console.error('Error deleting license:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover licença",
        variant: "destructive",
      });
      throw error;
    }
  };

  const assignSeat = async (seatId: string, personId: string, newCode?: string) => {
    try {
      const updateData: any = {
        person_id: personId,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Se um novo código foi fornecido, incluí-lo na atualização
      if (newCode !== undefined) {
        updateData.code = newCode || null;
      }

      const { data, error } = await supabase
        .from('seats')
        .update(updateData)
        .eq('id', seatId)
        .select()
        .single();

      if (error) throw error;

      const updatedSeat = mapDatabaseSeatToSeat(data);
      setSeats(prev => prev.map(seat => seat.id === seatId ? updatedSeat : seat));
      
      toast({
        title: "Sucesso",
        description: "Assento atribuído com sucesso",
      });

      return updatedSeat;
    } catch (error) {
      console.error('Error assigning seat:', error);
      toast({
        title: "Erro",
        description: "Falha ao atribuir assento",
        variant: "destructive",
      });
      throw error;
    }
  };

  const unassignSeat = async (seatId: string) => {
    try {
      const { data, error } = await supabase
        .from('seats')
        .update({
          person_id: null,
          assigned_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', seatId)
        .select()
        .single();

      if (error) throw error;

      const updatedSeat = mapDatabaseSeatToSeat(data);
      setSeats(prev => prev.map(seat => seat.id === seatId ? updatedSeat : seat));
      
      toast({
        title: "Sucesso",
        description: "Assento liberado com sucesso",
      });

      return updatedSeat;
    } catch (error) {
      console.error('Error unassigning seat:', error);
      toast({
        title: "Erro",
        description: "Falha ao liberar assento",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLicenses(), fetchSeats()]);
      setLoading(false);
    };

    if (currentOrganization?.id) {
      loadData();
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    // Escutar mudanças de organização
    const handleOrganizationChange = (event: CustomEvent) => {
      const { organizationId } = event.detail;
      console.log('Licenses data: Organization changed to:', organizationId);
      fetchLicenses();
      fetchSeats();
    };

    window.addEventListener('organizationChanged', handleOrganizationChange as EventListener);

    return () => {
      window.removeEventListener('organizationChanged', handleOrganizationChange as EventListener);
    };
  }, [currentOrganization?.id]);

  return {
    licenses,
    seats,
    loading,
    addLicense,
    updateLicense,
    deleteLicense,
    assignSeat,
    unassignSeat,
    refreshData: () => Promise.all([fetchLicenses(), fetchSeats()])
  };
}
