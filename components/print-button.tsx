'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-ink px-3 py-2.5 text-xs font-semibold text-white hover:bg-moss"><Printer size={14} />Print / save PDF</button>;
}
