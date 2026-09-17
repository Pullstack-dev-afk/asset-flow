'use client';

import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SearchResult = { id: string; label: string; detail: string; href: string; kind: 'Asset' | 'Employee' | 'Location' | 'Asset type' };

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); inputRef.current?.focus(); } };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setResults([]); setLoading(false); return; }
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const client = createClient();
      const pattern = `%${term}%`;
      const [{ data: assets }, { data: employees }, { data: locations }, { data: categories }] = await Promise.all([
        client.from('assets').select('id, name, asset_tag, serial_number, manufacturer, model, categories(name), employees(full_name)').or(`name.ilike.${pattern},asset_tag.ilike.${pattern},serial_number.ilike.${pattern},manufacturer.ilike.${pattern},model.ilike.${pattern}`).limit(8),
        client.from('employees').select('id, full_name, email, department, job_title').or(`full_name.ilike.${pattern},email.ilike.${pattern},department.ilike.${pattern},job_title.ilike.${pattern}`).limit(6),
        client.from('locations').select('id, name, address').or(`name.ilike.${pattern},address.ilike.${pattern}`).limit(4),
        client.from('categories').select('id, name').ilike('name', pattern).limit(4),
      ]);
      const assetResults = (assets ?? []).map((asset) => { const category = Array.isArray(asset.categories) ? asset.categories[0] : asset.categories; const employee = Array.isArray(asset.employees) ? asset.employees[0] : asset.employees; return { id: asset.id, label: asset.name, detail: [category?.name, asset.asset_tag, asset.serial_number, employee?.full_name].filter(Boolean).join(' · '), href: `/assets/${asset.id}`, kind: 'Asset' as const }; });
      const matchingEmployeeIds = (employees ?? []).map((employee) => employee.id);
      const { data: employeeAssets } = matchingEmployeeIds.length ? await client.from('assets').select('id, name, asset_tag, serial_number, assigned_employee_id, employees(full_name)').in('assigned_employee_id', matchingEmployeeIds).limit(8) : { data: [] };
      const employeeResults = (employees ?? []).map((employee) => ({ id: employee.id, label: employee.full_name, detail: [employee.job_title, employee.department, employee.email].filter(Boolean).join(' · '), href: `/employees/${employee.id}`, kind: 'Employee' as const }));
      const assignedAssetResults = (employeeAssets ?? []).map((asset) => { const employee = Array.isArray(asset.employees) ? asset.employees[0] : asset.employees; return { id: `assigned-${asset.id}`, label: asset.name, detail: `Assigned to ${employee?.full_name ?? 'employee'} · ${asset.asset_tag}${asset.serial_number ? ` · ${asset.serial_number}` : ''}`, href: `/assets/${asset.id}`, kind: 'Asset' as const }; });
      const locationResults = (locations ?? []).map((location) => ({ id: location.id, label: location.name, detail: location.address ?? 'Storage location', href: '/storage', kind: 'Location' as const }));
      const categoryResults = (categories ?? []).map((category) => ({ id: category.id, label: category.name, detail: 'Asset type', href: `/assets?category=${encodeURIComponent(category.name)}`, kind: 'Asset type' as const }));
      setResults([...assetResults, ...employeeResults, ...assignedAssetResults, ...locationResults, ...categoryResults]);
      setLoading(false);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query]);
  return <div className="fixed right-4 top-3 z-30 w-[min(420px,calc(100vw-5rem))] lg:right-8 lg:top-5"><div className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-ink/35" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workspace" aria-label="Search workspace" className="h-10 w-full border border-[#dfe5df] bg-white pl-10 pr-16 text-sm shadow-sm outline-none placeholder:text-ink/35 focus:border-moss" />{query ? <button aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-2 top-1.5 flex h-7 w-7 items-center justify-center text-ink/40"><X size={15} /></button> : <kbd className="absolute right-3 top-2.5 hidden text-[10px] text-ink/35 sm:block">⌘K</kbd>}</div>{(query.trim().length >= 2 || loading) && <div className="mt-2 max-h-[min(70vh,460px)] overflow-y-auto border border-[#dfe5df] bg-white p-2 shadow-xl">{loading ? <p className="px-3 py-4 text-xs text-ink/45">Searching workspace...</p> : results.length ? <div className="space-y-1">{results.map((result) => <Link key={`${result.kind}-${result.id}`} href={result.href} onClick={() => setQuery('')} className="block px-3 py-2.5 hover:bg-sage"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-ink">{result.label}</p><span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-moss">{result.kind}</span></div><p className="mt-1 truncate text-xs text-ink/45">{result.detail || 'Open record'}</p></Link>)}</div> : <p className="px-3 py-4 text-xs text-ink/45">No matching assets, people, locations, or types.</p>}</div>}</div>;
}
