import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';

export interface DatabaseTeam {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export function useTeamsData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useCurrentOrganization();

  const mapDatabaseTeamToTeam = (dbTeam: DatabaseTeam): Team => ({
    id: dbTeam.id,
    name: dbTeam.name,
    description: dbTeam.description || undefined,
    organizationId: dbTeam.organization_id,
    createdAt: new Date(dbTeam.created_at),
    updatedAt: new Date(dbTeam.updated_at)
  });

  const fetchTeams = async () => {
    if (!currentOrganization?.id) {
      console.log('Teams: No current organization, clearing teams');
      setTeams([]);
      setLoading(false);
      return;
    }
    
    try {
      console.log('Teams: Fetching for organization:', currentOrganization.id);
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (error) throw error;

      const mappedTeams = data.map(mapDatabaseTeamToTeam);
      console.log('Teams: Fetched teams:', mappedTeams.length);
      setTeams(mappedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar times",
        variant: "destructive",
      });
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description || null,
          organization_id: teamData.organizationId
        })
        .select()
        .single();

      if (error) throw error;

      const newTeam = mapDatabaseTeamToTeam(data);
      setTeams(prev => [newTeam, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Time adicionado com sucesso",
      });

      return newTeam;
    } catch (error: any) {
      console.error('Error adding team:', error);
      
      let errorMessage = "Falha ao adicionar time";
      if (error.code === '23505') {
        errorMessage = "Este nome de time já está sendo usado";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({
          ...(updates.name && { name: updates.name }),
          description: updates.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTeam = mapDatabaseTeamToTeam(data);
      setTeams(prev => prev.map(team => team.id === id ? updatedTeam : team));
      
      toast({
        title: "Sucesso",
        description: "Time atualizado com sucesso",
      });

      return updatedTeam;
    } catch (error: any) {
      console.error('Error updating team:', error);
      
      let errorMessage = "Falha ao atualizar time";
      if (error.code === '23505') {
        errorMessage = "Este nome de time já está sendo usado";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeams(prev => prev.filter(team => team.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Time removido com sucesso",
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover time",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [currentOrganization?.id]);

  // Listen for organization changes
  useEffect(() => {
    const handleOrganizationChange = () => {
      console.log('Teams: Organization changed, refetching data');
      fetchTeams();
    };

    window.addEventListener('organizationChanged', handleOrganizationChange);
    return () => window.removeEventListener('organizationChanged', handleOrganizationChange);
  }, [currentOrganization?.id]);

  return {
    teams,
    loading,
    addTeam,
    updateTeam,
    deleteTeam,
    refreshData: fetchTeams
  };
}
