'use client';

import { useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';

export function RoleEditor({ profileId, role, locked }: { profileId: string; role: UserRole; locked: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    setSaving(true);
    setError('');
    const { error: updateError } = await createClient().from('profiles').update({ role: value }).eq('id', profileId);
    if (updateError) setError(updateError.message);
    else router.refresh();
    setSaving(false);
  }
  if (locked) return <span className="text-xs text-ink/40">Your account</span>;
  return <div className="flex items-center justify-end gap-2"><select value={value} onChange={(event) => setValue(event.target.value as UserRole)} className="h-9 border border-[#dfe5df] bg-white px-2 text-xs capitalize outline-none focus:border-moss"><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></select><button onClick={save} disabled={saving || value === role} aria-label={`Save ${value} access`} className="flex h-9 w-9 items-center justify-center bg-ink text-white disabled:cursor-not-allowed disabled:opacity-35">{saving ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}</button>{error && <span className="text-xs text-[#a25c4c]">Could not save</span>}</div>;
}