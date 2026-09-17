create type public.user_role as enum ('admin', 'viewer');
create type public.asset_status as enum ('available', 'assigned', 'maintenance', 'retired');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text not null, email text not null, role public.user_role not null default 'viewer', avatar_url text, created_at timestamptz not null default now());
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null unique, icon text not null default 'package', created_at timestamptz not null default now());
create table public.locations (id uuid primary key default gen_random_uuid(), name text not null, address text, created_at timestamptz not null default now());
create table public.employees (id uuid primary key default gen_random_uuid(), full_name text not null, email text not null unique, department text not null, job_title text, avatar_url text, location_id uuid references public.locations(id) on delete set null, active boolean not null default true, created_at timestamptz not null default now());
create table public.assets (id uuid primary key default gen_random_uuid(), asset_tag text not null unique, name text not null, manufacturer text, model text, serial_number text unique, category_id uuid not null references public.categories(id), status public.asset_status not null default 'available', purchase_date date, warranty_until date, cost numeric(12, 2), assigned_employee_id uuid references public.employees(id) on delete set null, assigned_location_id uuid references public.locations(id) on delete set null, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), constraint one_assignment check (not (assigned_employee_id is not null and assigned_location_id is not null)));
create table public.asset_history (id uuid primary key default gen_random_uuid(), asset_id uuid not null references public.assets(id) on delete cascade, action text not null, from_employee_id uuid references public.employees(id) on delete set null, to_employee_id uuid references public.employees(id) on delete set null, from_location_id uuid references public.locations(id) on delete set null, to_location_id uuid references public.locations(id) on delete set null, performed_by uuid references public.profiles(id) on delete set null, notes text, created_at timestamptz not null default now());

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.employees enable row level security;
alter table public.assets enable row level security;
alter table public.asset_history enable row level security;
create policy "Authenticated users can read workspace data" on public.profiles for select to authenticated using (true);
create policy "Authenticated users can read categories" on public.categories for select to authenticated using (true);
create policy "Authenticated users can read locations" on public.locations for select to authenticated using (true);
create policy "Authenticated users can read employees" on public.employees for select to authenticated using (true);
create policy "Authenticated users can read assets" on public.assets for select to authenticated using (true);
create policy "Authenticated users can read asset history" on public.asset_history for select to authenticated using (true);
create or replace function public.is_admin() returns boolean language sql security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;
create policy "Admins can manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage locations" on public.locations for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage employees" on public.employees for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage assets" on public.assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can create history" on public.asset_history for insert to authenticated with check (public.is_admin());