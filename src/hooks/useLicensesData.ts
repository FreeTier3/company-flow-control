
import { useLicensesFetch } from '@/hooks/useLicensesFetch';
import { useSeatsFetch } from '@/hooks/useSeatsFetch';
import { useLicensesOperations } from '@/hooks/useLicensesOperations';

export function useLicensesData() {
  const {
    licenses,
    loading: licensesLoading,
    error: licensesError,
    refreshData: refreshLicenses,
    invalidateCache: invalidateLicensesCache
  } = useLicensesFetch();

  const {
    seats,
    loading: seatsLoading,
    error: seatsError,
    refreshData: refreshSeats,
    invalidateCache: invalidateSeatsCache
  } = useSeatsFetch();

  const { 
    addLicense, 
    updateLicense, 
    deleteLicense, 
    assignSeat, 
    unassignSeat 
  } = useLicensesOperations();

  const handleAddLicense = async (licenseData: Parameters<typeof addLicense>[0]) => {
    const result = await addLicense(licenseData, () => {
      invalidateLicensesCache();
      invalidateSeatsCache();
      refreshLicenses();
      refreshSeats();
    });
    return result;
  };

  const handleUpdateLicense = async (id: string, updates: Parameters<typeof updateLicense>[1]) => {
    const result = await updateLicense(id, updates, () => {
      invalidateLicensesCache();
      refreshLicenses();
    });
    return result;
  };

  const handleDeleteLicense = async (id: string) => {
    await deleteLicense(id, () => {
      invalidateLicensesCache();
      invalidateSeatsCache();
      refreshLicenses();
      refreshSeats();
    });
  };

  const handleAssignSeat = async (seatId: string, personId: string, newCode?: string) => {
    const result = await assignSeat(seatId, personId, newCode, () => {
      invalidateSeatsCache();
      refreshSeats();
    });
    return result;
  };

  const handleUnassignSeat = async (seatId: string) => {
    const result = await unassignSeat(seatId, () => {
      invalidateSeatsCache();
      refreshSeats();
    });
    return result;
  };

  return {
    licenses,
    seats,
    loading: licensesLoading || seatsLoading,
    error: licensesError || seatsError,
    addLicense: handleAddLicense,
    updateLicense: handleUpdateLicense,
    deleteLicense: handleDeleteLicense,
    assignSeat: handleAssignSeat,
    unassignSeat: handleUnassignSeat,
    refreshData: () => {
      refreshLicenses();
      refreshSeats();
    },
    invalidateCache: () => {
      invalidateLicensesCache();
      invalidateSeatsCache();
    }
  };
}
