
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const defaultOrganizationId = '00000000-0000-0000-0000-000000000001';

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

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('organization_id', defaultOrganizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedAssets = data.map(mapDatabaseAssetToAsset);
      setAssets(mappedAssets);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar ativos",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAssets();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    assets,
    loading,
    refreshData: fetchAssets
  };
}
