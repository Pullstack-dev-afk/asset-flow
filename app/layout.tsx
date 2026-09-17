import type { Metadata } from 'next';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
export const metadata: Metadata = { title: 'AssetFlow | Asset management, made clear', description: 'A calm, complete view of your company assets.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${dmSans.variable} ${spaceGrotesk.variable}`}><Sidebar /><main className="min-h-screen lg:pl-[248px]">{children}</main></body></html>; }