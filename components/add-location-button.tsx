'use client';

import { FormEvent, useState } from 'react';
import { LoaderCircle, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AddLocationButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); setError(''); const { error: insertError } = await createClient().from('locations').insert({ name, address: address || null }); if (insertError) { setError(insertError.message); setSaving(false); return; } setName(''); setAddress(''); setSaving(false); setOpen(false); router.refresh(); }
  return <><button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-moss"><Plus size={16} />Add location</button>{open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-6"><form onSubmit={submit} className="w-full max-w-md border border-[#dfe5df] bg-white p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><h2 className="font-display text-xl font-semibold">Add location</h2><p className="mt-1 text-xs text-ink/50">Create a storage or office location.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div><label className="block text-xs font-semibold text-ink/70">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm outline-none focus:border-moss" placeholder="HQ Storage" /></label><label className="mt-4 block text-xs font-semibold text-ink/70">Address<input value={address} onChange={(event) => setAddress(event.target.value)} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm outline-none focus:border-moss" placeholder="101 Market Street" /></label>{error && <p className="mt-4 bg-[#f8e9e5] p-3 text-xs text-[#a25c4c]">{error}</p>}<button disabled={saving} className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-white hover:bg-moss disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : 'Create location'}</button></form></div>}</>;
}
