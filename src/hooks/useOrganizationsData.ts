
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DatabaseOrganization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export function useOrganizationsData() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const mapDatabaseOrganizationToOrganization = (dbOrg: DatabaseOrganization): Organization => ({
    id: dbOrg.id,
    name: dbOrg.name,
    createdAt: new Date(dbOrg.created_at),
    updatedAt: new Date(dbOrg.updated_at)
  });

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedOrganizations = data.map(mapDatabaseOrganizationToOrganization);
      setOrganizations(mappedOrganizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar organizações",
        variant: "destructive",
      });
    }
  };

  const createOrganization = async (orgData: { name: string }): Promise<Organization> => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
        })
        .select()
        .single();

      if (error) throw error;

      const newOrganization = mapDatabaseOrganizationToOrganization(data);
      setOrganizations(prev => [newOrganization, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Organização criada com sucesso",
      });

      return newOrganization;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar organização",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrganization = async (id: string, updates: { name: string }): Promise<Organization> => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          name: updates.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedOrganization = mapDatabaseOrganizationToOrganization(data);
      setOrganizations(prev => 
        prev.map(org => org.id === id ? updatedOrganization : org)
      );
      
      toast({
        title: "Sucesso",
        description: "Organização atualizada com sucesso",
      });

      return updatedOrganization;
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar organização",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteOrganization = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrganizations(prev => prev.filter(org => org.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Organização excluída com sucesso",
      });
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir organização",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchOrganizations();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    organizations,
    loading,
    refreshData: fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization
  };
}
