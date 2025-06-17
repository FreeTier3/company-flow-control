
import { License, Seat } from '@/types';

export interface DatabaseLicense {
  id: string;
  name: string;
  description: string | null;
  total_seats: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSeat {
  id: string;
  license_id: string;
  code: string | null;
  person_id: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
}

export const mapDatabaseLicenseToLicense = (dbLicense: DatabaseLicense): License => ({
  id: dbLicense.id,
  name: dbLicense.name,
  description: dbLicense.description || undefined,
  totalSeats: dbLicense.total_seats,
  organizationId: dbLicense.organization_id,
  createdAt: new Date(dbLicense.created_at),
  updatedAt: new Date(dbLicense.updated_at)
});

export const mapDatabaseSeatToSeat = (dbSeat: DatabaseSeat): Seat => ({
  id: dbSeat.id,
  licenseId: dbSeat.license_id,
  code: dbSeat.code || undefined,
  personId: dbSeat.person_id || undefined,
  assignedAt: dbSeat.assigned_at ? new Date(dbSeat.assigned_at) : undefined,
  createdAt: new Date(dbSeat.created_at),
  updatedAt: new Date(dbSeat.updated_at)
});
