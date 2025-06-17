
import { usePeopleFetch } from '@/hooks/usePeopleFetch';
import { usePeopleTeams } from '@/hooks/usePeopleTeams';
import { usePeopleOperations } from '@/hooks/usePeopleOperations';

export function usePeopleData() {
  const {
    people,
    loading: peopleLoading,
    error: peopleError,
    refreshData: refreshPeople,
    invalidateCache: invalidatePeopleCache
  } = usePeopleFetch();

  const {
    teams,
    loading: teamsLoading,
    error: teamsError,
    refreshData: refreshTeams,
    invalidateCache: invalidateTeamsCache
  } = usePeopleTeams();

  const { addPerson, updatePerson, deletePerson } = usePeopleOperations();

  const handleAddPerson = async (personData: Parameters<typeof addPerson>[0]) => {
    const result = await addPerson(personData, () => {
      invalidatePeopleCache();
      refreshPeople();
    });
    return result;
  };

  const handleUpdatePerson = async (id: string, updates: Parameters<typeof updatePerson>[1]) => {
    const result = await updatePerson(id, updates, () => {
      invalidatePeopleCache();
      refreshPeople();
    });
    return result;
  };

  const handleDeletePerson = async (id: string) => {
    await deletePerson(id, () => {
      invalidatePeopleCache();
      refreshPeople();
    });
  };

  return {
    people,
    teams,
    loading: peopleLoading || teamsLoading,
    error: peopleError || teamsError,
    addPerson: handleAddPerson,
    updatePerson: handleUpdatePerson,
    deletePerson: handleDeletePerson,
    refreshData: () => {
      refreshPeople();
      refreshTeams();
    },
    invalidateCache: () => {
      invalidatePeopleCache();
      invalidateTeamsCache();
    }
  };
}
