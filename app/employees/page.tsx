import Link from 'next/link';
import { Mail, Search } from 'lucide-react';
import { getCurrentProfile, getEmployees } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { AddEmployeeButton } from '@/components/add-employee-button';
import { AssignAssetButton } from '@/components/assign-asset-button';
import { EditEmployeeButton } from '@/components/edit-employee-button';
import { DeleteButton } from '@/components/delete-button';

export default async function EmployeesPage() {
  const [employees, profile] = await Promise.all([getEmployees(), getCurrentProfile()]);
  const canEdit = profile?.role !== 'viewer';
  return <div className="mx-auto max-w-[1400px] px-6 pb-12 pt-16 sm:px-10 lg:px-14 lg:pt-20"><PageHeader eyebrow="People" title="Employees" description="The people responsible for your assets." action={canEdit ? <AddEmployeeButton /> : undefined} /><div className="mb-6 max-w-md"><div className="relative"><Search size={16} className="absolute left-3 top-3 text-ink/35" /><input placeholder="Search employees" className="h-10 w-full border border-[#dfe5df] bg-white pl-10 pr-4 text-sm outline-none placeholder:text-ink/35 focus:border-moss" /></div></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{employees.map((employee) => <article key={employee.id} className="border border-[#dfe5df] bg-white p-5"><div className="flex items-start justify-between"><Link href={`/employees/${employee.id}`} className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage font-display text-sm font-semibold text-moss">{employee.initials}</div><div><h2 className="text-[14px] font-semibold text-ink hover:text-moss">{employee.name}</h2><p className="mt-0.5 text-xs text-ink/50">{employee.role}</p></div></Link>{canEdit && <div className="flex items-center gap-3"><span className="rounded-full bg-sage px-2 py-1 text-[10px] font-semibold text-moss">{employee.active ? 'Active' : 'Inactive'}</span><EditEmployeeButton employee={employee} /><DeleteButton table="employees" id={employee.id} label={employee.name} /></div>}</div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#edf0ed] pt-4"><div><p className="text-[10px] uppercase tracking-[0.1em] text-ink/35">Department</p><p className="mt-1 text-xs font-medium text-ink/70">{employee.department}</p></div><div><p className="text-[10px] uppercase tracking-[0.1em] text-ink/35">Assets</p><p className="mt-1 text-xs font-medium text-ink/70">{employee.assetCount} assigned</p></div></div><div className="mt-4 flex items-center gap-2 text-xs text-ink/45"><Mail size={13} />{employee.email}</div>{canEdit && <AssignAssetButton employeeId={employee.id} employeeName={employee.name} />}</article>)}</div></div>;
}
