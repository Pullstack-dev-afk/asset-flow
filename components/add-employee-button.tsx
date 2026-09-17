'use client';

import { FormEvent, useState } from 'react';
import { LoaderCircle, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AddEmployeeButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', department: '', role: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); setError(''); const { error: insertError } = await createClient().from('employees').insert({ full_name: form.name, email: form.email, department: form.department, job_title: form.role || null }); if (insertError) { setError(insertError.message); setSaving(false); return; } setForm({ name: '', email: '', department: '', role: '' }); setSaving(false); setOpen(false); router.refresh(); }
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value });
  return <><button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-moss"><Plus size={16} />Add employee</button>{open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-6"><form onSubmit={submit} className="w-full max-w-md border border-[#dfe5df] bg-white p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><h2 className="font-display text-xl font-semibold">Add employee</h2><p className="mt-1 text-xs text-ink/50">Add a team member to your workspace.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div>{[['name', 'Full name', 'Maya Chen'], ['email', 'Work email', 'maya@company.com'], ['department', 'Department', 'Design'], ['role', 'Job title', 'Product Designer']].map(([key, label, placeholder]) => <label key={key} className="mt-4 block text-xs font-semibold text-ink/70 first:mt-0">{label}<input required={key !== 'role'} type={key === 'email' ? 'email' : 'text'} value={form[key as keyof typeof form]} onChange={update(key as keyof typeof form)} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm outline-none focus:border-moss" placeholder={placeholder} /></label>)}{error && <p className="mt-4 bg-[#f8e9e5] p-3 text-xs text-[#a25c4c]">{error}</p>}<button disabled={saving} className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-white hover:bg-moss disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : 'Create employee'}</button></form></div>}</>;
}
