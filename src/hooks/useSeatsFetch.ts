
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Seat } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useCachedData } from '@/hooks/useCachedData';
import { mapDatabaseSeatToSeat } from '@/utils/licensesMappers';

export function useSeatsFetch() {
  const { toast } = useToast();
  const { currentOrganization } = useCurrentOrganization();

  const fetchSeats = useCallback(async (): Promise<Seat[]> => {
    if (!currentOrganization?.id) {
      console.log('Seats: No current organization, returning empty array');
      return [];
    }
    
    try {
      console.log('Seats: Fetching for organization:', currentOrganization.id);
      
      // Buscar apenas assentos das licenças da organização atual
      const { data, error } = await supabase
        .from('seats')
        .select(`
          *,
          licenses!inner(organization_id)
        `)
        .eq('licenses.organization_id', currentOrganization.id)
        .order('created_at');

      if (error) throw error;

      const mappedSeats = data.map(seat => mapDatabaseSeatToSeat({
        id: seat.id,
        license_id: seat.license_id,
        code: seat.code,
        person_id: seat.person_id,
        assigned_at: seat.assigned_at,
        created_at: seat.created_at,
        updated_at: seat.updated_at
      }));
      console.log('Seats: Fetched seats:', mappedSeats.length);
      return mappedSeats;
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar assentos",
        variant: "destructive",
      });
      return [];
    }
  }, [currentOrganization?.id, toast]);

  // Custom post-processing function to ensure cached data has proper Date objects
  const postProcessCachedData = useCallback((cachedData: any[]): Seat[] => {
    if (!Array.isArray(cachedData)) return [];
    
    return cachedData.map(item => ({
      ...item,
      assignedAt: item.assignedAt ? new Date(item.assignedAt) : undefined,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));
  }, []);

  const {
    data: seats,
    loading: seatsLoading,
    error: seatsError,
    refreshData: refreshSeats,
    invalidateCache: invalidateSeatsCache
  } = useCachedData(
    fetchSeats,
    {
      key: `seats-${currentOrganization?.id || 'no-org'}`,
      ttl: 10, // 10 minutes cache
      postProcess: postProcessCachedData
    },
    [currentOrganization?.id]
  );

  return {
    seats: seats || [],
    loading: seatsLoading,
    error: seatsError,
    refreshData: refreshSeats,
    invalidateCache: invalidateSeatsCache
  };
}
