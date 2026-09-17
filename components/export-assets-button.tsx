'use client';

import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function ExportAssetsButton() {
  const [exporting, setExporting] = useState(false);
  async function exportAssets() {
    setExporting(true);
    const { data, error } = await createClient().from('assets').select('asset_tag, name, manufacturer, model, serial_number, status, purchase_date, warranty_until, cost, categories(name), employees(full_name, email), locations(name, address)').order('created_at', { ascending: false });
    if (error) { window.alert(error.message); setExporting(false); return; }
    const rows = (data ?? []).map((asset) => {
      const category = Array.isArray(asset.categories) ? asset.categories[0] : asset.categories;
      const employee = Array.isArray(asset.employees) ? asset.employees[0] : asset.employees;
      const location = Array.isArray(asset.locations) ? asset.locations[0] : asset.locations;
      return { 'Asset tag': asset.asset_tag, 'Asset name': asset.name, Manufacturer: asset.manufacturer ?? '', Model: asset.model ?? '', 'Serial number': asset.serial_number ?? '', Category: category?.name ?? '', Status: asset.status, 'Purchase date': asset.purchase_date ?? '', 'Warranty until': asset.warranty_until ?? '', Value: asset.cost ?? '', 'Assigned to': employee?.full_name ?? '', 'Employee email': employee?.email ?? '', Location: location?.name ?? '', 'Location address': location?.address ?? '' };
    });
    const columns = ['Asset tag', 'Asset name', 'Manufacturer', 'Model', 'Serial number', 'Category', 'Status', 'Purchase date', 'Warranty until', 'Value', 'Assigned to', 'Employee email', 'Location', 'Location address'];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [columns, ...rows.map((row) => columns.map((column) => escape(row[column as keyof typeof row])))]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `assetflow-assets-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }
  return <button onClick={exportAssets} disabled={exporting} className="flex items-center justify-center gap-2 rounded-lg border border-[#cbd6cb] bg-white px-4 py-2.5 text-[13px] font-semibold text-ink/70 hover:border-moss hover:text-moss disabled:opacity-60">{exporting ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}Export Excel CSV</button>;
}
