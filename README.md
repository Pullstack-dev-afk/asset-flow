# AssetFlow

AssetFlow is a focused asset management MVP built with Next.js, TypeScript, Tailwind CSS, and Supabase. It is designed to deploy as a single application on Vercel.

## Local setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add the Supabase project values.
4. Run `npm run dev`.

Run `supabase/schema.sql` in the Supabase SQL editor before connecting real workspace data. The schema creates profiles, categories, locations, employees, assets, and asset history, with Admin and Viewer roles enforced through row-level security.

## Verification

`npm run build` creates the production build. The workspace reads records directly from Supabase; empty tables appear as empty states until you add real records.