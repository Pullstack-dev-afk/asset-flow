import { createClient } from '@/lib/supabase/server';
import type { Asset, Employee, HistoryEvent, UserRole } from '@/lib/types';

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('id, full_name, email, role').eq('id', user.id).maybeSingle();
  return data as { id: string; full_name: string; email: string; role: UserRole } | null;
}

export async function getProfiles() {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: true });
  return (data ?? []) as { id: string; full_name: string; email: string; role: UserRole; created_at: string }[];
}

export async function getAssets(): Promise<Asset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('assets').select('id, asset_tag, name, status, serial_number, manufacturer, model, purchase_date, warranty_until, cost, notes, assigned_at, assigned_employee_id, categories(name), employees(full_name), locations(id, name)').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((asset) => {
    const category = Array.isArray(asset.categories) ? asset.categories[0] : asset.categories;
    const employee = Array.isArray(asset.employees) ? asset.employees[0] : asset.employees;
    const location = Array.isArray(asset.locations) ? asset.locations[0] : asset.locations;
    return { id: asset.id, assetTag: asset.asset_tag, name: asset.name, category: category?.name ?? 'Uncategorized', categoryColor: '#dbe8dc', status: asset.status, assignee: employee?.full_name ?? null, assigneeId: asset.assigned_employee_id ?? null, location: location?.name ?? 'Unassigned', locationId: location?.id ?? null, warrantyUntil: asset.warranty_until ?? 'No warranty', serialNumber: asset.serial_number ?? 'No serial number', manufacturer: asset.manufacturer ?? '', model: asset.model ?? '', purchaseDate: asset.purchase_date ?? null, notes: asset.notes ?? null, assignedAt: asset.assigned_at ?? null, value: Number(asset.cost ?? 0) };
  });
}

export async function getEmployees(): Promise<Employee[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('employees').select('id, full_name, email, phone, department, job_title, active, locations(name), assets(id)').order('full_name');
  if (error || !data) return [];
  return data.map((employee) => { const location = Array.isArray(employee.locations) ? employee.locations[0] : employee.locations; return { id: employee.id, name: employee.full_name, initials: employee.full_name.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(), department: employee.department, role: employee.job_title ?? 'Team member', email: employee.email, phone: employee.phone ?? null, active: employee.active, assetCount: Array.isArray(employee.assets) ? employee.assets.length : 0, location: location?.name ?? 'Unassigned' }; });
}

export async function getHistory(): Promise<HistoryEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('asset_history').select('id, action, created_at, assets(name), profiles(full_name), employees(full_name), locations(name)').order('created_at', { ascending: false }).limit(50);
  if (error || !data) return [];
  return data.map((event) => { const asset = Array.isArray(event.assets) ? event.assets[0] : event.assets; const actor = Array.isArray(event.profiles) ? event.profiles[0] : event.profiles; const employee = Array.isArray(event.employees) ? event.employees[0] : event.employees; const location = Array.isArray(event.locations) ? event.locations[0] : event.locations; const created = new Date(event.created_at); return { id: event.id, action: event.action, asset: asset?.name ?? 'Unknown asset', actor: actor?.full_name ?? 'System', target: employee?.full_name ?? location?.name ?? 'Unassigned', date: created.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), time: created.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }; });
}

export type LocationSummary = { id: string; name: string; address: string; count: number; capacity: number };

export async function getLocationSummaries(): Promise<LocationSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('locations').select('id, name, address, assets(id)').order('name');
  if (error || !data) return [];
  return data.map((location) => ({ id: location.id, name: location.name, address: location.address ?? 'No address provided', count: Array.isArray(location.assets) ? location.assets.length : 0, capacity: Math.min(100, Math.round(((Array.isArray(location.assets) ? location.assets.length : 0) / 50) * 100)) }));
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const [{ count: total }, { count: assigned }, { count: stored }, { data: statuses }] = await Promise.all([
    supabase.from('assets').select('*', { count: 'exact', head: true }),
    supabase.from('assets').select('*', { count: 'exact', head: true }).eq('status', 'assigned'),
    supabase.from('assets').select('*', { count: 'exact', head: true }).not('assigned_location_id', 'is', null),
    supabase.from('assets').select('status'),
  ]);
  const counts = (statuses ?? []).reduce<Record<string, number>>((result, asset) => { result[asset.status] = (result[asset.status] ?? 0) + 1; return result; }, {});
  return { total: total ?? 0, assigned: assigned ?? 0, stored: stored ?? 0, available: counts.available ?? 0, other: (counts.maintenance ?? 0) + (counts.retired ?? 0) };
}

export async function getAssetDetail(id: string) {
  const supabase = await createClient();
  const [{ data: asset }, { data: history }, { data: issues }] = await Promise.all([
    supabase.from('assets').select('id, asset_tag, name, status, serial_number, manufacturer, model, purchase_date, warranty_until, cost, notes, assigned_at, assigned_employee_id, assigned_location_id, created_at, categories(name), employees(id, full_name, email), locations(id, name, address)').eq('id', id).maybeSingle(),
    supabase.from('asset_history').select('id, action, created_at, notes, previous_status, new_status, from_employee_id, to_employee_id, from_location_id, to_location_id, profiles(full_name), from_employee:employees!asset_history_from_employee_id_fkey(full_name), to_employee:employees!asset_history_to_employee_id_fkey(full_name), from_location:locations!asset_history_from_location_id_fkey(name), to_location:locations!asset_history_to_location_id_fkey(name)').eq('asset_id', id).order('created_at', { ascending: false }),
    supabase.from('asset_issues').select('id, description, priority, status, notes, created_at, resolved_at, profiles(full_name)').eq('asset_id', id).order('created_at', { ascending: false }),
  ]);
  if (!asset) return null;
  const category = Array.isArray(asset.categories) ? asset.categories[0] : asset.categories;
  const employee = Array.isArray(asset.employees) ? asset.employees[0] : asset.employees;
  const location = Array.isArray(asset.locations) ? asset.locations[0] : asset.locations;
  return { asset: { ...asset, category: category?.name ?? 'Uncategorized', employee, location }, history: history ?? [], issues: issues ?? [] };
}

export async function getEmployeeDetail(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('employees').select('id, full_name, email, phone, department, job_title, active, locations(id, name, address), assets(id, asset_tag, name, status, serial_number, manufacturer, model, assigned_at, categories(name), locations(id, name))').eq('id', id).maybeSingle();
  if (!data) return null;
  const location = Array.isArray(data.locations) ? data.locations[0] : data.locations;
  return { ...data, location, assets: data.assets ?? [] };
}