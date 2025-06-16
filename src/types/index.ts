
export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  id: string;
  email: string;
  password?: string;
  name: string;
  position: string;
  reportsTo?: string; // ID da pessoa superior
  teamId?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface License {
  id: string;
  name: string;
  description?: string;
  totalSeats: number;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Seat {
  id: string;
  licenseId: string;
  code?: string;
  personId?: string;
  assignedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  name: string;
  serialNumber?: string;
  brand: string;
  value: number;
  personId?: string;
  organizationId: string;
  assignedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  filename: string;
  fileUrl: string;
  personId?: string;
  organizationId: string;
  uploadedAt: Date;
}

export interface DashboardStats {
  totalPeople: number;
  totalTeams: number;
  totalAssets: number;
  totalLicenses: number;
  availableSeats: number;
  assignedAssets: number;
}
