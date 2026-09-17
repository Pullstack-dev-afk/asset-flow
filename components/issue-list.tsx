'use client';

import { useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function IssueList({ issues, canEdit = true }: { issues: Array<{ id: string; description: string; priority: string; status: string; notes: string | null; created_at: string; resolved_at: string | null; profiles: { full_name: string } | { full_name: string }[] | null }>; canEdit?: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState('');
  async function updateIssue(id: string, status: string) { setSaving(id); await createClient().from('asset_issues').update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null }).eq('id', id); setSaving(''); router.refresh(); }
  if (!issues.length) return <p className="border border-dashed border-[#cbd6cb] p-6 text-sm text-ink/45">No issues reported for this asset.</p>;
  return <div className="space-y-3">{issues.map((issue) => { const reporter = Array.isArray(issue.profiles) ? issue.profiles[0] : issue.profiles; return <article key={issue.id} className="border border-[#dfe5df] bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-ink">{issue.description}</span><span className="rounded-full bg-[#f4eadb] px-2 py-1 text-[10px] font-semibold capitalize text-[#9a6827]">{issue.priority}</span><span className="rounded-full bg-sage px-2 py-1 text-[10px] font-semibold capitalize text-moss">{issue.status.replace('_', ' ')}</span></div><p className="mt-2 text-xs text-ink/45">Reported {new Date(issue.created_at).toLocaleString()} by {reporter?.full_name ?? 'Workspace user'}</p>{issue.notes && <p className="mt-2 text-xs text-ink/60">{issue.notes}</p>}</div>{canEdit && issue.status !== 'resolved' && <button onClick={() => updateIssue(issue.id, 'resolved')} disabled={saving === issue.id} className="flex items-center gap-1.5 text-xs font-semibold text-moss hover:underline">{saving === issue.id ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}Resolve</button>}</div></article>; })}</div>;
}
