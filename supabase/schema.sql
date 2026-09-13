-- ====================================================================
-- QHSSE DMS — Database Schema for Supabase PostgreSQL
-- PT Taka Hydrocore Indonesia
-- ====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── 1. PROFILES & USER ACCOUNTS ──────────────────────────────────────
drop table if exists public.profiles cascade;

create table public.profiles (
  id text primary key,
  username text unique not null,
  password text not null default '12345',
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'staff')),
  role_name text not null,
  department text not null,
  position text not null,
  avatar text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Data: 2 Akun Admin QMS & 8 Akun Staff Tiap Departemen (Password: 12345)
insert into public.profiles (id, username, password, name, email, role, role_name, department, position, avatar)
values
  ('admin-rizal', 'rizal', '12345', 'Rizal', 'rizal@thi.co.id', 'admin', 'Admin QMS', 'QHSE & QMS', 'Lead Quality & Management System', 'RZ'),
  ('admin-khabil', 'khabil', '12345', 'Khabil', 'khabil@thi.co.id', 'admin', 'Admin QMS', 'QHSE & QMS', 'Document Controller & QMS Admin', 'KB'),
  ('staff-geo', 'geotechnical', '12345', 'Staff Geotechnical', 'geotechnical@thi.co.id', 'staff', 'Staff Geotechnical', 'Geotechnical', 'Document Controller Geotechnical', 'GT'),
  ('staff-ops', 'operations', '12345', 'Staff Operations', 'operations@thi.co.id', 'staff', 'Staff Operations', 'Operations', 'Document Controller Operations', 'OP'),
  ('staff-eng', 'engineering', '12345', 'Staff Engineering', 'engineering@thi.co.id', 'staff', 'Staff Engineering', 'Engineering', 'Document Controller Engineering', 'EN'),
  ('staff-hr', 'hr', '12345', 'Staff HR & General Affairs', 'hr.ga@thi.co.id', 'staff', 'Staff HR & GA', 'HR & General Affairs', 'Document Controller HR & GA', 'HR'),
  ('staff-fin', 'finance', '12345', 'Staff Finance & Accounting', 'finance@thi.co.id', 'staff', 'Staff Finance & Accounting', 'Finance & Accounting', 'Document Controller Finance', 'FA'),
  ('staff-it', 'it', '12345', 'Staff Information Technology', 'it@thi.co.id', 'staff', 'Staff IT', 'Information Technology', 'Document Controller IT', 'IT'),
  ('staff-env', 'environment', '12345', 'Staff Environment', 'environment@thi.co.id', 'staff', 'Staff Environment', 'Environment', 'Document Controller Environment', 'EV'),
  ('staff-com', 'commercial', '12345', 'Staff Commercial & Logistics', 'commercial@thi.co.id', 'staff', 'Staff Commercial & Logistics', 'Commercial & Logistics', 'Document Controller Commercial', 'CL')
on conflict (id) do update
set
  username = excluded.username,
  password = excluded.password,
  name = excluded.name,
  role = excluded.role,
  role_name = excluded.role_name,
  department = excluded.department,
  position = excluded.position,
  avatar = excluded.avatar;

-- ── 2. MASTER FOLDERS & SUBFOLDERS ───────────────────────────────────
create table if not exists public.master_folders (
  id text primary key,
  number text,
  name text not null,
  category text not null default 'HEAD_OFFICE',
  description text,
  icon text default 'Folder',
  sort_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.master_subfolders (
  id text primary key,
  folder_id text references public.master_folders(id) on delete cascade,
  parent_id text references public.master_subfolders(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── 3. DOCUMENTS & CLOUDFLARE R2 METADATA ───────────────────────────
create table if not exists public.documents (
  id text primary key,
  folder_id text references public.master_folders(id) on delete set null,
  subfolder_id text references public.master_subfolders(id) on delete set null,
  subfolder_name text,
  number text not null,
  title text not null,
  type text not null default 'SOP',
  revision text not null default 'Rev.00',
  effective_date text,
  review_date text,
  status text not null default 'CURRENT',
  classification text not null default 'INTERNAL',
  file_size text,
  file_ext text default 'pdf',
  
  -- Cloudflare R2 object storage columns
  r2_bucket text,
  r2_key text,
  r2_url text,
  
  uploaded_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── 4. AUDIT LOGS ───────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  action text not null,
  user_name text not null,
  user_email text,
  role text,
  entity text,
  detail text,
  type text default 'create',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── 5. SUGGESTIONS & IDEAS ──────────────────────────────────────────
create table if not exists public.suggestions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  department text not null,
  submitted_by text not null,
  status text default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── 6. ROW LEVEL SECURITY (RLS) ─────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.master_folders enable row level security;
alter table public.master_subfolders enable row level security;
alter table public.audit_logs enable row level security;
alter table public.suggestions enable row level security;

-- Allow read access to authenticated & anon for demo/portal
drop policy if exists "Allow public read profiles" on public.profiles;
create policy "Allow public read profiles" on public.profiles for select using (true);

drop policy if exists "Allow public read documents" on public.documents;
create policy "Allow public read documents" on public.documents for select using (true);

drop policy if exists "Allow public insert documents" on public.documents;
create policy "Allow public insert documents" on public.documents for insert with check (true);

drop policy if exists "Allow public update documents" on public.documents;
create policy "Allow public update documents" on public.documents for update using (true);

drop policy if exists "Allow public delete documents" on public.documents;
create policy "Allow public delete documents" on public.documents for delete using (true);

drop policy if exists "Allow public read folders" on public.master_folders;
create policy "Allow public read folders" on public.master_folders for select using (true);

drop policy if exists "Allow public read subfolders" on public.master_subfolders;
create policy "Allow public read subfolders" on public.master_subfolders for select using (true);

drop policy if exists "Allow public read audit_logs" on public.audit_logs;
create policy "Allow public read audit_logs" on public.audit_logs for select using (true);

drop policy if exists "Allow public insert audit_logs" on public.audit_logs;
create policy "Allow public insert audit_logs" on public.audit_logs for insert with check (true);

drop policy if exists "Allow public read suggestions" on public.suggestions;
create policy "Allow public read suggestions" on public.suggestions for select using (true);

drop policy if exists "Allow public insert suggestions" on public.suggestions;
create policy "Allow public insert suggestions" on public.suggestions for insert with check (true);
