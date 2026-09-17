'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { data, error: signupError } = await createClient().auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (signupError) { setError(signupError.message); setLoading(false); return; }
    if (data.session) window.location.assign('/');
    else setMessage('Account created. Check your email to confirm your account, then sign in.');
    setLoading(false);
  }

  return <main className="flex min-h-screen w-full items-center justify-center bg-paper px-6 py-12 lg:ml-[-248px] lg:w-[calc(100%+248px)]"><div className="w-full max-w-[420px]"><div className="mb-12 text-center"><p className="font-display text-[25px] font-semibold tracking-[-0.05em] text-ink">asset<span className="text-moss">flow</span><span className="text-amber">.</span></p><p className="mt-8 text-xs font-semibold uppercase tracking-[0.15em] text-moss">Create your account</p><h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-ink">Join the workspace.</h1><p className="mt-2 text-sm text-ink/50">Create an account to access your company assets.</p></div><form onSubmit={handleSubmit} className="border border-[#dfe5df] bg-white p-6 shadow-[0_12px_40px_rgba(23,33,31,0.04)]"><label className="block text-xs font-semibold text-ink/70">Full name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm text-ink outline-none focus:border-moss" placeholder="Maya Chen" /></label><label className="mt-5 block text-xs font-semibold text-ink/70">Work email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm text-ink outline-none focus:border-moss" placeholder="you@company.com" /></label><label className="mt-5 block text-xs font-semibold text-ink/70">Password<input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full border border-[#dfe5df] px-3 text-sm text-ink outline-none focus:border-moss" placeholder="At least 6 characters" /></label>{error && <p className="mt-4 bg-[#f8e9e5] px-3 py-2 text-xs text-[#a25c4c]">{error}</p>}{message && <p className="mt-4 bg-sage px-3 py-2 text-xs text-moss">{message}</p>}<button disabled={loading} className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-white transition-colors hover:bg-moss disabled:cursor-wait disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <>Create account <ArrowRight size={16} /></>}</button></form><p className="mt-6 text-center text-xs text-ink/45">Already have an account? <Link href="/login" className="font-semibold text-moss hover:underline">Sign in</Link></p></div></main>;
}
