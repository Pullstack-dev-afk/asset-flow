'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Clock3, LayoutDashboard, LogOut, MapPin, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const links = [{ href: '/', label: 'Overview', icon: LayoutDashboard }, { href: '/assets', label: 'Assets', icon: Box }, { href: '/employees', label: 'Employees', icon: Users }, { href: '/storage', label: 'Storage', icon: MapPin }, { href: '/history', label: 'History', icon: Clock3 }];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({ name: 'Workspace user', role: 'AssetFlow' });
  useEffect(() => { if (pathname === '/login') return; const client = createClient(); client.auth.getUser().then(async ({ data }) => { if (!data.user) return; const { data: record } = await client.from('profiles').select('full_name, role').eq('id', data.user.id).maybeSingle(); setProfile({ name: record?.full_name ?? data.user.email?.split('@')[0] ?? 'Workspace user', role: record?.role === 'admin' ? 'Administrator' : 'Viewer' }); }); }, [pathname]);
  if (pathname === '/login') return null;
  async function signOut() { await createClient().auth.signOut(); window.location.assign('/login'); }
  return <><button aria-label="Open navigation" className="fixed left-4 top-4 z-40 rounded-lg bg-ink p-2.5 text-white lg:hidden" onClick={() => setOpen(true)}><Box size={20} /></button>{open && <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} />}<aside className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-[#dfe5df] bg-[#fbfcf8] px-5 py-7 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between px-2"><Link href="/" className="font-display text-[22px] font-semibold tracking-[-0.04em] text-ink">asset<span className="text-moss">flow</span><span className="text-amber">.</span></Link><button className="text-ink/50 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button></div><div className="mb-3 mt-14 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">Workspace</div><nav className="space-y-1">{links.map(({ href, label, icon: Icon }) => { const active = href === '/' ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${active ? 'bg-sage text-ink' : 'text-ink/60 hover:bg-sage/60 hover:text-ink'}`}><Icon size={17} strokeWidth={active ? 2.2 : 1.8} />{label}</Link>; })}</nav><div className="mt-auto border-t border-[#dfe5df] pt-5"><div className="flex items-center gap-3 px-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4e1d4] font-display text-xs font-semibold text-moss">{profile.name.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-[13px] font-semibold text-ink">{profile.name}</p><p className="text-[11px] text-ink/50">{profile.role}</p></div><button onClick={signOut} aria-label="Sign out" className="ml-auto text-ink/30 hover:text-ink"><LogOut size={16} /></button></div></div></aside></>;
}
