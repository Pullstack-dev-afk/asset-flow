alter type public.user_role add value if not exists 'editor';

drop policy if exists "Admins can manage categories" on public.categories;
drop policy if exists "Admins can manage locations" on public.locations;
drop policy if exists "Admins can manage employees" on public.employees;
drop policy if exists "Admins can manage assets" on public.assets;
drop policy if exists "Admins can create history" on public.asset_history;
drop policy if exists "Admins can manage profiles" on public.profiles;

create policy "Admins can manage profiles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Editors can manage categories" on public.categories for all to authenticated using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor')));
create policy "Editors can manage locations" on public.locations for all to authenticated using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor')));
create policy "Editors can manage employees" on public.employees for all to authenticated using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor')));
create policy "Editors can manage assets" on public.assets for all to authenticated using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor')));
create policy "Editors can create history" on public.asset_history for insert to authenticated with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor')));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
