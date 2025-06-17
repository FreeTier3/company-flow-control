
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useCachedData } from '@/hooks/useCachedData';
import { useCallback } from 'react';

export interface DatabaseAsset {
  id: string;
  name: string;
  serial_number: string | null;
  brand: string;
  value: number;
  person_id: string | null;
  organization_id: string;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAssetsData() {
  const { toast } = useToast();
  const { currentOrganization } = useCurrentOrganization();

  const mapDatabaseAssetToAsset = (dbAsset: DatabaseAsset): Asset => ({
    id: dbAsset.id,
    name: dbAsset.name,
    serialNumber: dbAsset.serial_number || undefined,
    brand: dbAsset.brand,
    value: dbAsset.value,
    personId: dbAsset.person_id || undefined,
    organizationId: dbAsset.organization_id,
    assignedAt: dbAsset.assigned_at ? new Date(dbAsset.assigned_at) : undefined,
    createdAt: new Date(dbAsset.created_at),
    updatedAt: new Date(dbAsset.updated_at)
  });

  const fetchAssets = useCallback(async (): Promise<Asset[]> => {
    if (!currentOrganization?.id) {
      console.log('Assets: No current organization, returning empty array');
      return [];
    }
    
    try {
      console.log('Assets: Fetching for organization:', currentOrganization.id);
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedAssets = data.map(mapDatabaseAssetToAsset);
      console.log('Assets: Fetched assets:', mappedAssets.length);
      return mappedAssets;
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar ativos",
        variant: "destructive",
      });
      return [];
    }
  }, [currentOrganization?.id, toast]);

  const {
    data: assets,
    loading,
    error,
    refreshData,
    invalidateCache
  } = useCachedData(
    fetchAssets,
    {
      key: `assets-${currentOrganization?.id || 'no-org'}`,
      ttl: 10 // 10 minutes cache
    },
    [currentOrganization?.id]
  );

  return {
    assets: assets || [],
    loading,
    error,
    refreshData,
    invalidateCache
  };
}
