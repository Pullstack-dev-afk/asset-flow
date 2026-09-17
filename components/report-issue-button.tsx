'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, Check, LoaderCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function ReportIssueButton({ assetId, assetName, canEdit = true }: { assetId: string; assetName: string; canEdit?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    const client = createClient(); const { data: userData } = await client.auth.getUser();
    const { error: insertError } = await client.from('asset_issues').insert({ asset_id: assetId, description, priority, notes: notes || null, reported_by: userData.user?.id ?? null });
    if (insertError) { setError(insertError.message); setSaving(false); return; }
    setSaving(false); setDescription(''); setNotes(''); setOpen(false); router.refresh();
  }
  if (!canEdit) return null;
  return <><button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg border border-[#cbd6cb] px-3 py-2.5 text-xs font-semibold text-ink/70 hover:border-moss hover:text-moss"><AlertCircle size={14} />Report issue</button>{open && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/30 px-5 py-8"><form onSubmit={submit} className="w-full max-w-md border border-[#dfe5df] bg-white p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><h2 className="font-display text-xl font-semibold">Report an issue</h2><p className="mt-1 text-xs text-ink/50">Add a maintenance note for {assetName}.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div><label className="block text-xs font-semibold text-ink/70">Description<textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-moss" placeholder="What needs attention?" /></label><label className="mt-5 block text-xs font-semibold text-ink/70">Priority<select value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-2 h-11 w-full border border-[#dfe5df] bg-white px-3 text-sm capitalize outline-none focus:border-moss"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label><label className="mt-5 block text-xs font-semibold text-ink/70">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="mt-2 w-full border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-moss" placeholder="Optional notes" /></label>{error && <p className="mt-4 bg-[#f8e9e5] p-3 text-xs text-[#a25c4c]">{error}</p>}<button disabled={saving} className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-white hover:bg-moss disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <><Check size={16} />Save issue</>}</button></form></div>}</>;
}
