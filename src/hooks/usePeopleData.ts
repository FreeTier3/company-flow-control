import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Person, Team } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';

export interface DatabasePerson {
  id: string;
  email: string;
  name: string;
  position: string;
  reports_to: string | null;
  team_id: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTeam {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export function usePeopleData() {
  const [people, setPeople] = useState<Person[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useCurrentOrganization();

  const mapDatabasePersonToPerson = (dbPerson: DatabasePerson): Person => ({
    id: dbPerson.id,
    email: dbPerson.email,
    name: dbPerson.name,
    position: dbPerson.position,
    reportsTo: dbPerson.reports_to || undefined,
    teamId: dbPerson.team_id || undefined,
    organizationId: dbPerson.organization_id,
    createdAt: new Date(dbPerson.created_at),
    updatedAt: new Date(dbPerson.updated_at)
  });

  const mapDatabaseTeamToTeam = (dbTeam: DatabaseTeam): Team => ({
    id: dbTeam.id,
    name: dbTeam.name,
    description: dbTeam.description || undefined,
    organizationId: dbTeam.organization_id,
    createdAt: new Date(dbTeam.created_at),
    updatedAt: new Date(dbTeam.updated_at)
  });

  const fetchPeople = async () => {
    if (!currentOrganization?.id) {
      console.log('People: No current organization, clearing people');
      setPeople([]);
      return;
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
      setPeople(mappedPeople);
    } catch (error) {
      console.error('Error fetching people:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar pessoas",
        variant: "destructive",
      });
    }
  };

  const fetchTeams = async () => {
    if (!currentOrganization?.id) {
      console.log('People Hook: No current organization, clearing teams');
      setTeams([]);
      return;
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
      setTeams(mappedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar times",
        variant: "destructive",
      });
    }
  };

  const addPerson = async (personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .insert({
          email: personData.email,
          name: personData.name,
          position: personData.position,
          reports_to: personData.reportsTo || null,
          team_id: personData.teamId || null,
          organization_id: personData.organizationId
        })
        .select()
        .single();

      if (error) throw error;

      const newPerson = mapDatabasePersonToPerson(data);
      setPeople(prev => [newPerson, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Pessoa adicionada com sucesso",
      });

      return newPerson;
    } catch (error: any) {
      console.error('Error adding person:', error);
      
      let errorMessage = "Falha ao adicionar pessoa";
      if (error.code === '23505') {
        errorMessage = "Este email já está sendo usado";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePerson = async (id: string, updates: Partial<Person>) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .update({
          ...(updates.email && { email: updates.email }),
          ...(updates.name && { name: updates.name }),
          ...(updates.position && { position: updates.position }),
          reports_to: updates.reportsTo || null,
          team_id: updates.teamId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedPerson = mapDatabasePersonToPerson(data);
      setPeople(prev => prev.map(person => person.id === id ? updatedPerson : person));
      
      toast({
        title: "Sucesso",
        description: "Pessoa atualizada com sucesso",
      });

      return updatedPerson;
    } catch (error: any) {
      console.error('Error updating person:', error);
      
      let errorMessage = "Falha ao atualizar pessoa";
      if (error.code === '23505') {
        errorMessage = "Este email já está sendo usado";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePerson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPeople(prev => prev.filter(person => person.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Pessoa removida com sucesso",
      });
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover pessoa",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPeople(), fetchTeams()]);
      setLoading(false);
    };

    loadData();
  }, [currentOrganization?.id]);

  return {
    people,
    teams,
    loading,
    addPerson,
    updatePerson,
    deletePerson,
    refreshData: () => Promise.all([fetchPeople(), fetchTeams()])
  };
}
