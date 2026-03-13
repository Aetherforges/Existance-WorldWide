# EXIST WORLD WIDE

Luxury minimal ecommerce platform built with Next.js 14, Supabase, TailwindCSS, Chart.js, Lucide, and Framer Motion.

## Features
- Netflix-style landing intro
- Product grid with modal gallery (up to 5 images)
- Cart drawer with quantity controls
- Checkout flow with delivery options
- Supabase Auth (email + password, OTP verification)
- Admin dashboard with analytics charts
- Product and order management
- Customer account order history

## Folder Structure
- `src/app` App Router pages and API routes
- `src/components` UI components
- `src/context` React Context providers
- `src/lib` Supabase client and helpers
- `src/styles` Theme tokens
- `supabase/schema.sql` Database schema

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` based on `.env.example`.
3. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
4. Create a storage bucket named `product-images` (public).
5. Run the dev server:
   ```bash
   npm run dev
   ```

## Supabase Auth
- Enable Email Auth in Supabase
- Enable email verification (OTP or email link)

## Admin Access
- Admin credentials are validated against environment variables:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
- Admin routes are protected by `middleware.js` and server layout checks.

## Deployment on Vercel
1. Push the repository to GitHub.
2. Create a new Vercel project and import the repo.
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
4. Deploy.

## Notes
- For production, tighten Supabase RLS policies and consider server-side admin APIs.
- Do not expose a Supabase service role key to the client.
