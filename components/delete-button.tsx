'use client';

import { useState } from 'react';
import { LoaderCircle, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type TableName = 'employees' | 'assets' | 'locations';
export function DeleteButton({ table, id, label }: { table: TableName; id: string; label: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  async function remove() { setDeleting(true); setError(''); const { error: deleteError } = await createClient().from(table).delete().eq('id', id); if (deleteError) { setError(deleteError.message); setDeleting(false); return; } setOpen(false); router.refresh(); }
  return <><button onClick={() => setOpen(true)} aria-label={`Delete ${label}`} className="text-ink/30 hover:text-[#a25c4c]"><Trash2 size={15} /></button>{open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-6"><div className="w-full max-w-sm border border-[#dfe5df] bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 className="font-display text-xl font-semibold">Delete {label}?</h2><p className="mt-2 text-sm leading-6 text-ink/55">This action cannot be undone.</p></div><button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div>{error && <p className="mt-4 bg-[#f8e9e5] p-3 text-xs text-[#a25c4c]">{error}</p>}<div className="mt-6 flex gap-3"><button onClick={() => setOpen(false)} className="h-10 flex-1 border border-[#dfe5df] text-sm font-semibold text-ink/65">Cancel</button><button onClick={remove} disabled={deleting} className="flex h-10 flex-1 items-center justify-center gap-2 bg-[#a25c4c] text-sm font-semibold text-white disabled:opacity-60">{deleting ? <LoaderCircle size={16} className="animate-spin" /> : <><Trash2 size={15} />Delete</>}</button></div></div></div>}</>;
}
