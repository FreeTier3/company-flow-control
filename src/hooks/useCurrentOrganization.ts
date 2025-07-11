
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useCurrentOrganization() {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentOrganization();
  }, []);

  const loadCurrentOrganization = async () => {
    try {
      // Primeiro tenta carregar a organização salva no localStorage
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      
      if (savedOrgId) {
        console.log('Loading saved organization:', savedOrgId);
        const { data: org, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', savedOrgId)
          .single();

        if (!error && org) {
          const mappedOrg: Organization = {
            id: org.id,
            name: org.name,
            createdAt: new Date(org.created_at),
            updatedAt: new Date(org.updated_at)
          };
          setCurrentOrganization(mappedOrg);
          console.log('Loaded saved organization:', mappedOrg.name);
          setLoading(false);
          return;
        }
      }

      // Se não tem organização salva ou não foi encontrada, carrega a primeira disponível
      console.log('Loading first available organization');
      const { data: organizations, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (organizations && organizations.length > 0) {
        const org = organizations[0];
        const mappedOrg: Organization = {
          id: org.id,
          name: org.name,
          createdAt: new Date(org.created_at),
          updatedAt: new Date(org.updated_at)
        };
        setCurrentOrganization(mappedOrg);
        localStorage.setItem('currentOrganizationId', mappedOrg.id);
        console.log('Loaded first organization:', mappedOrg.name);
      }
    } catch (error) {
      console.error('Error loading current organization:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar organização atual",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = async (organizationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;

      const mappedOrg: Organization = {
        id: data.id,
        name: data.name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Salva a nova organização
      localStorage.setItem('currentOrganizationId', mappedOrg.id);
      setCurrentOrganization(mappedOrg);
      
      toast({
        title: "Sucesso",
        description: `Organização alterada para: ${mappedOrg.name}`,
      });

      console.log('Organization switched to:', mappedOrg.name);
      
      // Dispara evento personalizado para forçar atualização de todos os componentes
      window.dispatchEvent(new CustomEvent('organizationChanged', { 
        detail: { organizationId: mappedOrg.id } 
      }));

    } catch (error) {
      console.error('Error switching organization:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar organização",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    currentOrganization,
    loading,
    switchOrganization,
    refreshCurrentOrganization: loadCurrentOrganization
  };
}
