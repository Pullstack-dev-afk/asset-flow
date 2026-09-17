'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowRightLeft, Check, LoaderCircle, MapPin, PackageCheck, RotateCcw, Wrench, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AssetStatus } from '@/lib/types';

type Action = 'assign' | 'return' | 'move' | 'repair' | 'repair_complete' | 'missing' | 'retire';
type AssetState = { id: string; name: string; status: AssetStatus; assigned_employee_id: string | null; assigned_location_id: string | null };
type Option = { id: string; name: string };
const actionLabels: Record<Action, string> = { assign: 'Assign asset', return: 'Return to storage', move: 'Move asset', repair: 'Send for repair', repair_complete: 'Return from repair', missing: 'Mark as missing', retire: 'Retire asset' };

export function AssetActions({ asset, canEdit = true }: { asset: AssetState; canEdit?: boolean }) {
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [locations, setLocations] = useState<Option[]>([]);
  const [target, setTarget] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!action) return; const client = createClient(); Promise.all([client.from('employees').select('id, full_name').eq('active', true).order('full_name'), client.from('locations').select('id, name').order('name')]).then(([employeeResult, locationResult]) => { setEmployees((employeeResult.data ?? []).map((item) => ({ id: item.id, name: item.full_name }))); setLocations(locationResult.data ?? []); }); }, [action]);
  if (!canEdit) return <p className="text-xs text-ink/45">View-only access. Ask an administrator for edit permission.</p>;
  function open(nextAction: Action) { setError(''); setTarget(''); setNotes(''); setAction(nextAction); }
  function validate() {
    if (action === 'assign' && asset.assigned_employee_id) return 'Return this asset before assigning it to another employee.';
    if (action === 'move' && asset.assigned_employee_id) return 'Return this asset before moving it into storage.';
    if (action === 'return' && !asset.assigned_employee_id) return 'This asset is not assigned to an employee.';
    if (action === 'assign' && !target) return 'Choose an employee.';
    if ((action === 'move' || action === 'return') && !target) return 'Choose a storage location.';
    if (action === 'repair' && asset.assigned_employee_id) return 'Return this asset before sending it for repair.';
    if (action === 'repair_complete' && asset.status !== 'under_repair' && asset.status !== 'maintenance') return 'This asset is not currently under repair.';
    return '';
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    if (!action) return;
    setSaving(true); setError('');
    const client = createClient();
    const { data: userData } = await client.auth.getUser();
    const next: { status: AssetStatus; assigned_employee_id: string | null; assigned_location_id: string | null; assigned_at: string | null } = { status: asset.status, assigned_employee_id: asset.assigned_employee_id, assigned_location_id: asset.assigned_location_id, assigned_at: null };
    if (action === 'assign') { next.status = 'assigned'; next.assigned_employee_id = target; next.assigned_location_id = null; next.assigned_at = new Date().toISOString(); }
    if (action === 'return') { next.status = 'in_storage'; next.assigned_employee_id = null; next.assigned_location_id = target; }
    if (action === 'move') { next.status = 'in_storage'; next.assigned_employee_id = null; next.assigned_location_id = target; }
    if (action === 'repair') { next.status = 'under_repair'; next.assigned_employee_id = null; next.assigned_location_id = null; }
    if (action === 'repair_complete') { next.status = 'available'; next.assigned_employee_id = null; next.assigned_location_id = null; }
    if (action === 'missing') { next.status = 'missing'; next.assigned_employee_id = null; next.assigned_location_id = null; }
    if (action === 'retire') { next.status = 'retired'; next.assigned_employee_id = null; next.assigned_location_id = null; }
    const { error: updateError } = await client.from('assets').update(next).eq('id', asset.id);
    if (updateError) { setError(updateError.message); setSaving(false); return; }
    const { error: historyError } = await client.from('asset_history').insert({ asset_id: asset.id, action: actionLabels[action], from_employee_id: asset.assigned_employee_id, to_employee_id: next.assigned_employee_id, from_location_id: asset.assigned_location_id, to_location_id: next.assigned_location_id, previous_status: asset.status, new_status: next.status, performed_by: userData.user?.id ?? null, notes: notes || null });
    if (historyError) { setError(historyError.message); setSaving(false); return; }
    setSaving(false); setAction(null); router.refresh();
  }
  const actionButtons: { action: Action; icon: typeof Check; className: string }[] = [
    { action: 'assign', icon: PackageCheck, className: 'bg-ink text-white hover:bg-moss' },
    { action: 'return', icon: RotateCcw, className: 'border border-[#cbd6cb] text-ink/70 hover:border-moss hover:text-moss' },
    { action: 'move', icon: MapPin, className: 'border border-[#cbd6cb] text-ink/70 hover:border-moss hover:text-moss' },
    { action: 'repair', icon: Wrench, className: 'border border-[#cbd6cb] text-ink/70 hover:border-moss hover:text-moss' },
    { action: 'repair_complete', icon: Check, className: 'border border-[#cbd6cb] text-ink/70 hover:border-moss hover:text-moss' },
    { action: 'missing', icon: ArrowRightLeft, className: 'border border-[#cbd6cb] text-ink/70 hover:border-moss hover:text-moss' },
    { action: 'retire', icon: X, className: 'border border-[#cbd6cb] text-[#a25c4c] hover:border-[#a25c4c]' },
  ];
  return <><div className="flex flex-wrap gap-2">{actionButtons.map(({ action: nextAction, icon: Icon, className }) => <button key={nextAction} onClick={() => open(nextAction)} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold ${className}`}><Icon size={14} />{actionLabels[nextAction]}</button>)}</div>{action && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/30 px-5 py-8"><form onSubmit={submit} className="w-full max-w-md border border-[#dfe5df] bg-white p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><h2 className="font-display text-xl font-semibold">{actionLabels[action]}</h2><p className="mt-1 text-xs text-ink/50">Update {asset.name} and record the change.</p></div><button type="button" onClick={() => setAction(null)} aria-label="Close"><X size={18} /></button></div>{(action === 'assign' || action === 'return' || action === 'move') && <label className="block text-xs font-semibold text-ink/70">{action === 'assign' ? 'Employee' : 'Storage location'}<select required value={target} onChange={(event) => setTarget(event.target.value)} className="mt-2 h-11 w-full border border-[#dfe5df] bg-white px-3 text-sm outline-none focus:border-moss"><option value="">Choose {action === 'assign' ? 'an employee' : 'a location'}</option>{(action === 'assign' ? employees : locations).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>}<label className="mt-5 block text-xs font-semibold text-ink/70">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="mt-2 w-full border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-moss" placeholder="Optional context for the audit log" /></label>{error && <p className="mt-4 bg-[#f8e9e5] p-3 text-xs text-[#a25c4c]">{error}</p>}<button disabled={saving} className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-white hover:bg-moss disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <><Check size={16} />Confirm action</>}</button></form></div>}</>;
}
