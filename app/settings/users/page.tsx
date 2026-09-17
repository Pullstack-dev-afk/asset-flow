import { redirect } from 'next/navigation';
import { getCurrentProfile, getProfiles } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { RoleEditor } from '@/components/role-editor';

export default async function UsersPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') redirect('/');
  const profiles = await getProfiles();
  return <div className="mx-auto max-w-[1100px] px-6 pb-12 pt-9 sm:px-10 lg:px-14 lg:pt-12"><PageHeader eyebrow="Administration" title="Team access" description="Choose who can view the workspace and who can edit it." /><div className="overflow-x-auto border border-[#dfe5df] bg-white"><table className="w-full min-w-[620px] text-left"><thead className="border-b border-[#e6ebe6] bg-[#fbfcf9] text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40"><tr><th className="px-5 py-3.5">Account</th><th className="px-5 py-3.5">Access</th><th className="px-5 py-3.5 text-right">Change</th></tr></thead><tbody className="divide-y divide-[#edf0ed]">{profiles.map((member) => <tr key={member.id} className="text-[13px]"><td className="px-5 py-4"><p className="font-semibold text-ink">{member.full_name}</p><p className="mt-1 text-xs text-ink/45">{member.email}</p></td><td className="px-5 py-4 capitalize text-ink/60">{member.role}</td><td className="px-5 py-4 text-right"><RoleEditor profileId={member.id} role={member.role} locked={member.id === profile.id} /></td></tr>)}</tbody></table></div></div>;
}