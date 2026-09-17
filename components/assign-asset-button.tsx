'use client';

import { useEffect, useState } from 'react';
import { Check, LoaderCircle, PackagePlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type AssetOption = { id: string; name: string; asset_tag: string; assigned_employee_id: string | null };

export function AssignAssetButton({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [assetId, setAssetId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!open) return; createClient().from('assets').select('id, name, asset_tag, assigned_employee_id').order('name').then(({ data, error: queryError }) => { if (queryError) setError(queryError.message); setAssets(data ?? []); }); }, [open]);

  async function assignAsset() {
    if (!assetId) return;
    setSaving(true);
    setError('');
    const client = createClient();
    const { data: userData } = await client.auth.getUser();
    const previous = assets.find((asset) => asset.id === assetId)?.assigned_employee_id;
    const { error: updateError } = await client.from('assets').update({ assigned_employee_id: employeeId, assigned_location_id: null, status: 'assigned' }).eq('id', assetId);
    if (updateError) { setError(updateError.message); setSaving(false); return; }
    const { error: historyError } = await client.from('asset_history').insert({ asset_id: assetId, action: previous ? 'Reassigned' : 'Assigned', from_employee_id: previous, to_employee_id: employeeId, performed_by: userData.user?.id ?? null });
    if (historyError) { setError(historyError.message); setSaving(false); return; }
    setSaving(false);
    setAssetId('');
    setOpen(false);
    router.refresh();
  }

  return <><button onClick={() => setOpen(true)} className="mt-5 flex items-center gap-2 text-xs font-semibold text-moss hover:underline"><PackagePlus size={14} />Assign asset</button>{open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-6"><div className="w-full max-w-md border border-[#dfe5df] bg-white p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><h2 className="font-display text-xl font-semibold">Assign an asset</h2><p className="mt-1 text-xs text-ink/50">Choose inventory for {employeeName}.</p></div><button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div><label className="block text-xs font-semibold text-ink/70">Asset<select value={assetId} onChange={(event) => setAssetId(event.target.value)} className="mt-2 h-11 w-full border border-[#dfe5df] bg-white px-3 text-sm outline-none focus:border-moss"><option value="">Select an asset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.asset_tag}{asset.assigned_employee_id ? ' · currently assigned' : ''}</option>)}</select></label>{error && <p className="mt-4 bg-[#f8e9e5] p-3 text-xs text-[#a25c4c]">{error}</p>}<button onClick={assignAsset} disabled={!assetId || saving} className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-white hover:bg-moss disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <><Check size={16} />Assign asset</>}</button></div></div>}</>;
}
