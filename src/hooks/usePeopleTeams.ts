
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useCachedData } from '@/hooks/useCachedData';
import { mapDatabaseTeamToTeam } from '@/utils/peopleMappers';

export function usePeopleTeams() {
  const { toast } = useToast();
  const { currentOrganization } = useCurrentOrganization();

  const fetchTeams = useCallback(async (): Promise<Team[]> => {
    if (!currentOrganization?.id) {
      console.log('People Hook: No current organization, returning empty array');
      return [];
    }
    
    try {
      console.log('People Hook: Fetching teams for organization:', currentOrganization.id);
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (error) throw error;

      const mappedTeams = data.map(mapDatabaseTeamToTeam);
      console.log('People Hook: Fetched teams:', mappedTeams.length);
      return mappedTeams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar times",
        variant: "destructive",
      });
      return [];
    }
  }, [currentOrganization?.id, toast]);

  const {
    data: teams,
    loading: teamsLoading,
    error: teamsError,
    refreshData: refreshTeams,
    invalidateCache: invalidateTeamsCache
  } = useCachedData(
    fetchTeams,
    {
      key: `people-teams-${currentOrganization?.id || 'no-org'}`,
      ttl: 15 // 15 minutes cache
    },
    [currentOrganization?.id]
  );

  return {
    teams: teams || [],
    loading: teamsLoading,
    error: teamsError,
    refreshData: refreshTeams,
    invalidateCache: invalidateTeamsCache
  };
}
