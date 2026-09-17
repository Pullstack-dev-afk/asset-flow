alter type public.asset_status add value if not exists 'in_storage';
alter type public.asset_status add value if not exists 'under_repair';
alter type public.asset_status add value if not exists 'missing';
alter table public.employees add column if not exists phone text;
alter table public.assets add column if not exists assigned_at timestamptz;
alter table public.asset_history add column if not exists previous_status public.asset_status;
alter table public.asset_history add column if not exists new_status public.asset_status;

do $$ begin
	if not exists (select 1 from pg_type where typname = 'issue_priority') then create type public.issue_priority as enum ('low', 'medium', 'high', 'critical'); end if;
	if not exists (select 1 from pg_type where typname = 'issue_status') then create type public.issue_status as enum ('open', 'in_progress', 'resolved'); end if;
end $$;
create table if not exists public.asset_issues (id uuid primary key default gen_random_uuid(), asset_id uuid not null references public.assets(id) on delete cascade, description text not null, priority public.issue_priority not null default 'medium', status public.issue_status not null default 'open', notes text, reported_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), resolved_at timestamptz);
alter table public.asset_issues enable row level security;

drop policy if exists "Authenticated users can read asset issues" on public.asset_issues;
drop policy if exists "Editors can manage asset issues" on public.asset_issues;
create policy "Authenticated users can read asset issues" on public.asset_issues for select to authenticated using (true);
create policy "Editors can manage asset issues" on public.asset_issues for all to authenticated using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor')));
