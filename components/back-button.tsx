'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();
  function goBack() { if (window.history.length > 1) router.back(); else router.push('/'); }
  return <button onClick={goBack} className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-ink/50 transition-colors hover:text-moss"><ArrowLeft size={16} />Back</button>;
}
