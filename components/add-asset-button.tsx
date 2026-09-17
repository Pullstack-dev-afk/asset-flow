'use client';

import { FormEvent, useEffect, useState } from 'react';
import { LoaderCircle, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Option = { id: string; name: string };
const initialForm = { name: '', tag: '', serial: '', category: '', manufacturer: '', model: '', location: '', purchaseDate: '', warranty: '', cost: '', notes: '' };

export function AddAssetButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Option[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!open) return; createClient().from('locations').select('id, name').order('name').then(({ data }) => setLocations(data ?? [])); }, [open]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); const client = createClient();
    const { data: category, error: categoryError } = await client.from('categories').upsert({ name: form.category, icon: 'package' }, { onConflict: 'name' }).select('id').single();
    if (categoryError || !category) { setError(categoryError?.message ?? 'Could not create category'); setSaving(false); return; }
    const { data: userData } = await client.auth.getUser();
    const { data: asset, error: insertError } = await client.from('assets').insert({ name: form.name, asset_tag: form.tag, serial_number: form.serial || null, category_id: category.id, manufacturer: form.manufacturer || null, model: form.model || null, assigned_location_id: form.location || null, purchase_date: form.purchaseDate || null, warranty_until: form.warranty || null, cost: form.cost ? Number(form.cost) : null, notes: form.notes || null, status: form.location ? 'in_storage' : 'available' }).select('id').single();
    if (insertError || !asset) { setError(insertError?.message ?? 'Could not create asset'); setSaving(false); return; }
    const { error: historyError } = await client.from('asset_history').insert({ asset_id: asset.id, action: 'Created', previous_status: null, new_status: form.location ? 'in_storage' : 'available', to_location_id: form.location || null, performed_by: userData.user?.id ?? null, notes: form.notes || null });
    if (historyError) { setError(historyError.message); setSaving(false); return; }
    setForm(initialForm); setSaving(false); setOpen(false); router.refresh();
  }
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [key]: event.target.value });
  return <><button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-moss"><Plus size={16} />Add asset</button>{open && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/30 px-5 py-8"><form onSubmit={submit} className="w-full max-w-2xl border border-[#dfe5df] bg-white p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><h2 className="font-display text-xl font-semibold">Add asset</h2><p className="mt-1 text-xs text-ink/50">Register an item in your inventory.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2">{[['name', 'Asset name', 'MacBook Pro'], ['tag', 'Asset tag', 'AST-0001'], ['serial', 'Serial number', 'Optional'], ['manufacturer', 'Brand', 'Apple'], ['model', 'Model', 'MacBook Pro 14'], ['cost', 'Value', 'Optional']].map(([key, label, placeholder]) => <label key={key} className="block text-xs font-semibold text-ink/70">{label}<input required={key === 'name' || key === 'tag'} type={key === 'cost' ? 'number' : 'text'} value={form[key as keyof typeof form]} onChange={update(key as keyof typeof form)} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm outline-none focus:border-moss" placeholder={placeholder} /></label>)}<label className="block text-xs font-semibold text-ink/70">Asset type<input required value={form.category} onChange={update('category')} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm outline-none focus:border-moss" placeholder="Laptop" /></label><label className="block text-xs font-semibold text-ink/70">Storage location<select value={form.location} onChange={update('location')} className="mt-2 h-11 w-full border border-[#dfe5df] bg-white px-3 text-sm outline-none focus:border-moss"><option value="">Unassigned</option>{locations.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label><label className="block text-xs font-semibold text-ink/70">Purchase date<input type="date" value={form.purchaseDate} onChange={update('purchaseDate')} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm outline-none focus:border-moss" /></label><label className="block text-xs font-semibold text-ink/70">Warranty until<input type="date" value={form.warranty} onChange={update('warranty')} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm outline-none focus:border-moss" /></label><label className="block text-xs font-semibold text-ink/70 sm:col-span-2">Notes<textarea value={form.notes} onChange={update('notes')} rows={3} className="mt-2 w-full border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-moss" placeholder="Optional details" /></label></div>{error && <p className="mt-4 bg-[#f8e9e5] p-3 text-xs text-[#a25c4c]">{error}</p>}<button disabled={saving} className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-white hover:bg-moss disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : 'Create asset'}</button></form></div>}</>;
}
