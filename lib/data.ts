import { createClient } from '@/lib/supabase/server';
import type { Asset, Employee, HistoryEvent } from '@/lib/types';

export async function getAssets(): Promise<Asset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('assets').select('id, asset_tag, name, status, serial_number, warranty_until, cost, categories(name), employees(full_name), locations(id, name)').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((asset) => {
    const category = Array.isArray(asset.categories) ? asset.categories[0] : asset.categories;
    const employee = Array.isArray(asset.employees) ? asset.employees[0] : asset.employees;
    const location = Array.isArray(asset.locations) ? asset.locations[0] : asset.locations;
    return { id: asset.id, assetTag: asset.asset_tag, name: asset.name, category: category?.name ?? 'Uncategorized', categoryColor: '#dbe8dc', status: asset.status, assignee: employee?.full_name ?? null, location: location?.name ?? 'Unassigned', locationId: location?.id ?? null, warrantyUntil: asset.warranty_until ?? 'No warranty', serialNumber: asset.serial_number ?? 'No serial number', value: Number(asset.cost ?? 0) };
  });
}

export async function getEmployees(): Promise<Employee[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('employees').select('id, full_name, email, department, job_title, locations(name), assets(id)').eq('active', true).order('full_name');
  if (error || !data) return [];
  return data.map((employee) => { const location = Array.isArray(employee.locations) ? employee.locations[0] : employee.locations; return { id: employee.id, name: employee.full_name, initials: employee.full_name.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(), department: employee.department, role: employee.job_title ?? 'Team member', email: employee.email, assetCount: Array.isArray(employee.assets) ? employee.assets.length : 0, location: location?.name ?? 'Unassigned' }; });
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