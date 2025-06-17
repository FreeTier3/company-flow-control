
import { supabase } from '@/integrations/supabase/client';
import { License } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { mapDatabaseLicenseToLicense, mapDatabaseSeatToSeat } from '@/utils/licensesMappers';

export function useLicensesOperations() {
  const { toast } = useToast();

  const addLicense = async (
    licenseData: Omit<License, 'id' | 'createdAt' | 'updatedAt'>,
    onSuccess?: () => void
  ) => {
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

      onSuccess?.();
      
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

  const updateLicense = async (
    id: string, 
    updates: Partial<License>,
    onSuccess?: () => void
  ) => {
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

      onSuccess?.();
      
      toast({
        title: "Sucesso",
        description: "Licença atualizada com sucesso",
      });

      return mapDatabaseLicenseToLicense(data);
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

  const deleteLicense = async (id: string, onSuccess?: () => void) => {
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

      onSuccess?.();
      
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

  const assignSeat = async (
    seatId: string, 
    personId: string, 
    newCode?: string,
    onSuccess?: () => void
  ) => {
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

      onSuccess?.();
      
      toast({
        title: "Sucesso",
        description: "Assento atribuído com sucesso",
      });

      return mapDatabaseSeatToSeat(data);
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

  const unassignSeat = async (seatId: string, onSuccess?: () => void) => {
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

      onSuccess?.();
      
      toast({
        title: "Sucesso",
        description: "Assento liberado com sucesso",
      });

      return mapDatabaseSeatToSeat(data);
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

  return {
    addLicense,
    updateLicense,
    deleteLicense,
    assignSeat,
    unassignSeat
  };
}
