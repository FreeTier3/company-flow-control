
import { useLocalStorage } from './useLocalStorage';
import { Person, Team, License, Seat, Asset, Document, DashboardStats } from '../types';

export function useCompanyData() {
  const [people, setPeople] = useLocalStorage<Person[]>('company_people', []);
  const [teams, setTeams] = useLocalStorage<Team[]>('company_teams', []);
  const [licenses, setLicenses] = useLocalStorage<License[]>('company_licenses', []);
  const [seats, setSeats] = useLocalStorage<Seat[]>('company_seats', []);
  const [assets, setAssets] = useLocalStorage<Asset[]>('company_assets', []);
  const [documents, setDocuments] = useLocalStorage<Document[]>('company_documents', []);

  const getDashboardStats = (): DashboardStats => {
    const availableSeats = seats.filter(seat => !seat.personId).length;
    const assignedAssets = assets.filter(asset => asset.personId).length;

    return {
      totalPeople: people.length,
      totalTeams: teams.length,
      totalAssets: assets.length,
      totalLicenses: licenses.length,
      availableSeats,
      assignedAssets
    };
  };

  const addPerson = (person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPerson: Person = {
      ...person,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPeople(prev => [...prev, newPerson]);
    return newPerson;
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople(prev => prev.map(person => 
      person.id === id 
        ? { ...person, ...updates, updatedAt: new Date() }
        : person
    ));
  };

  const deletePerson = (id: string) => {
    setPeople(prev => prev.filter(person => person.id !== id));
    // Remove person from seats and assets
    setSeats(prev => prev.map(seat => 
      seat.personId === id ? { ...seat, personId: undefined, assignedAt: undefined } : seat
    ));
    setAssets(prev => prev.map(asset => 
      asset.personId === id ? { ...asset, personId: undefined, assignedAt: undefined } : asset
    ));
  };

  const addTeam = (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTeam: Team = {
      ...team,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  const addLicense = (license: Omit<License, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLicense: License = {
      ...license,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setLicenses(prev => [...prev, newLicense]);
    
    // Create seats for the license
    const newSeats: Seat[] = Array.from({ length: license.totalSeats }, () => ({
      id: crypto.randomUUID(),
      licenseId: newLicense.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    setSeats(prev => [...prev, ...newSeats]);
    
    return newLicense;
  };

  const addAsset = (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAsset: Asset = {
      ...asset,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setAssets(prev => [...prev, newAsset]);
    return newAsset;
  };

  const assignAsset = (assetId: string, personId: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, personId, assignedAt: new Date() }
        : asset
    ));
  };

  const assignSeat = (seatId: string, personId: string) => {
    setSeats(prev => prev.map(seat => 
      seat.id === seatId 
        ? { ...seat, personId, assignedAt: new Date() }
        : seat
    ));
  };

  return {
    people,
    teams,
    licenses,
    seats,
    assets,
    documents,
    getDashboardStats,
    addPerson,
    updatePerson,
    deletePerson,
    addTeam,
    addLicense,
    addAsset,
    assignAsset,
    assignSeat,
    setPeople,
    setTeams,
    setLicenses,
    setSeats,
    setAssets,
    setDocuments
  };
}
