
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useCachedData } from '@/hooks/useCachedData';
import { mapDatabasePersonToPerson } from '@/utils/peopleMappers';

export function usePeopleFetch() {
  const { toast } = useToast();
  const { currentOrganization } = useCurrentOrganization();

  const fetchPeople = useCallback(async (): Promise<Person[]> => {
    if (!currentOrganization?.id) {
      console.log('People: No current organization, returning empty array');
      return [];
    }
    
    try {
      console.log('People: Fetching for organization:', currentOrganization.id);
      
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedPeople = data.map(mapDatabasePersonToPerson);
      console.log('People: Fetched people:', mappedPeople.length);
      return mappedPeople;
    } catch (error) {
      console.error('Error fetching people:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar pessoas",
        variant: "destructive",
      });
      return [];
    }
  }, [currentOrganization?.id, toast]);

  const {
    data: people,
    loading: peopleLoading,
    error: peopleError,
    refreshData: refreshPeople,
    invalidateCache: invalidatePeopleCache
  } = useCachedData(
    fetchPeople,
    {
      key: `people-${currentOrganization?.id || 'no-org'}`,
      ttl: 10 // 10 minutes cache
    },
    [currentOrganization?.id]
  );

  return {
    people: people || [],
    loading: peopleLoading,
    error: peopleError,
    refreshData: refreshPeople,
    invalidateCache: invalidatePeopleCache
  };
}
