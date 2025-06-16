
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create people table
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  reports_to UUID REFERENCES public.people(id),
  team_id UUID,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for team_id in people table
ALTER TABLE public.people ADD CONSTRAINT fk_people_team 
  FOREIGN KEY (team_id) REFERENCES public.teams(id);

-- Create licenses table
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_seats INTEGER NOT NULL DEFAULT 1,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seats table
CREATE TABLE public.seats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID REFERENCES public.licenses(id) NOT NULL,
  code TEXT,
  person_id UUID REFERENCES public.people(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  serial_number TEXT,
  brand TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  person_id UUID REFERENCES public.people(id),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  person_id UUID REFERENCES public.people(id),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert a default organization for development
INSERT INTO public.organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Empresa Padrão');

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access for now (you can restrict this later with authentication)
CREATE POLICY "Allow all operations on organizations" ON public.organizations FOR ALL USING (true);
CREATE POLICY "Allow all operations on people" ON public.people FOR ALL USING (true);
CREATE POLICY "Allow all operations on teams" ON public.teams FOR ALL USING (true);
CREATE POLICY "Allow all operations on licenses" ON public.licenses FOR ALL USING (true);
CREATE POLICY "Allow all operations on seats" ON public.seats FOR ALL USING (true);
CREATE POLICY "Allow all operations on assets" ON public.assets FOR ALL USING (true);
CREATE POLICY "Allow all operations on documents" ON public.documents FOR ALL USING (true);
