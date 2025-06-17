
import { Person, Team } from '@/types';

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

export const mapDatabasePersonToPerson = (dbPerson: DatabasePerson): Person => ({
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

export const mapDatabaseTeamToTeam = (dbTeam: DatabaseTeam): Team => ({
  id: dbTeam.id,
  name: dbTeam.name,
  description: dbTeam.description || undefined,
  organizationId: dbTeam.organization_id,
  createdAt: new Date(dbTeam.created_at),
  updatedAt: new Date(dbTeam.updated_at)
});
