
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { mapDatabasePersonToPerson, DatabasePerson } from '@/utils/peopleMappers';

export function usePeopleOperations() {
  const { toast } = useToast();

  const addPerson = useCallback(async (
    personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>,
    onSuccess?: () => void
  ) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .insert({
          email: personData.email,
          name: personData.name,
          position: personData.position,
          reports_to: personData.reportsTo || null,
          team_id: personData.teamId || null,
          organization_id: personData.organizationId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pessoa adicionada com sucesso",
      });

      if (onSuccess) onSuccess();
      return mapDatabasePersonToPerson(data);
    } catch (error: any) {
      console.error('Error adding person:', error);
      
      let errorMessage = "Falha ao adicionar pessoa";
      if (error.code === '23505') {
        errorMessage = "Este email já está sendo usado";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updatePerson = useCallback(async (
    id: string, 
    updates: Partial<Person>,
    onSuccess?: () => void
  ) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .update({
          ...(updates.email && { email: updates.email }),
          ...(updates.name && { name: updates.name }),
          ...(updates.position && { position: updates.position }),
          reports_to: updates.reportsTo || null,
          team_id: updates.teamId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pessoa atualizada com sucesso",
      });

      if (onSuccess) onSuccess();
      return mapDatabasePersonToPerson(data);
    } catch (error: any) {
      console.error('Error updating person:', error);
      
      let errorMessage = "Falha ao atualizar pessoa";
      if (error.code === '23505') {
        errorMessage = "Este email já está sendo usado";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deletePerson = useCallback(async (id: string, onSuccess?: () => void) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pessoa removida com sucesso",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover pessoa",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return {
    addPerson,
    updatePerson,
    deletePerson
  };
}
