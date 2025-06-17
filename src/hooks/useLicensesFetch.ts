
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { License } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useCachedData } from '@/hooks/useCachedData';
import { mapDatabaseLicenseToLicense } from '@/utils/licensesMappers';

export function useLicensesFetch() {
  const { toast } = useToast();
  const { currentOrganization } = useCurrentOrganization();

  const fetchLicenses = useCallback(async (): Promise<License[]> => {
    if (!currentOrganization?.id) {
      console.log('Licenses: No current organization, returning empty array');
      return [];
    }
    
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
      return mappedLicenses;
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar licenças",
        variant: "destructive",
      });
      return [];
    }
  }, [currentOrganization?.id, toast]);

  // Custom post-processing function to ensure cached data has proper Date objects
  const postProcessCachedData = useCallback((cachedData: any[]): License[] => {
    if (!Array.isArray(cachedData)) return [];
    
    return cachedData.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));
  }, []);

  const {
    data: licenses,
    loading: licensesLoading,
    error: licensesError,
    refreshData: refreshLicenses,
    invalidateCache: invalidateLicensesCache
  } = useCachedData(
    fetchLicenses,
    {
      key: `licenses-${currentOrganization?.id || 'no-org'}`,
      ttl: 15, // 15 minutes cache
      postProcess: postProcessCachedData
    },
    [currentOrganization?.id]
  );

  return {
    licenses: licenses || [],
    loading: licensesLoading,
    error: licensesError,
    refreshData: refreshLicenses,
    invalidateCache: invalidateLicensesCache
  };
}
