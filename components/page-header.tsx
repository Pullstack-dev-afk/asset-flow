import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-moss">{eyebrow}</p>}<h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-ink">{title}</h1>{description && <p className="mt-2 text-[14px] text-ink/55">{description}</p>}</div>{action}</header>;
}