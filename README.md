# Career Radar

AI career intelligence and job application assistant. A multi-tenant SaaS
app that builds a structured, evidence-backed "Career DNA" for each user,
scores job opportunities on qualification fit, career fit, and opportunity
quality (not just keyword matching), and helps produce a truthful, tailored
application package - with the user approving everything before it's used.

See the full product spec in the original brief for the complete phase plan.
This repo is being built phase by phase; unfinished nav sections are clearly
labeled "Coming in Phase N" rather than shipped as non-functional UI.

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (base-ui primitives)
- Supabase (Postgres, Auth, Storage, Row Level Security)
- Heineken GenAI Brewery (internal AI gateway; structured outputs validated with Zod)
- Vercel

## Multi-tenancy

Every user-owned table has a `user_id` column with Row Level Security
restricting access to the owning user. Nothing about any individual user
(name, employer, skills, resume content, preferences) is hard-coded - all of
it comes from authenticated database records. See `supabase/migrations/`.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then copy `.env.example` to `.env.local` and
   fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only - never expose to the client)
   - `GENAI_API_KEY` and `GENAI_MODEL` (server-only - see "AI provider" below)

3. Run the migrations against your Supabase project (via the Supabase CLI or
   SQL editor), in order:

   ```
   supabase/migrations/0001_init.sql
   supabase/migrations/0002_storage.sql
   supabase/migrations/0003_job_sources_seed.sql
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

## AI provider

AI calls (job parsing, job matching, etc.) go through Heineken's internal
GenAI Brewery gateway (`genai.heineken.com`), not a public model API - see
`src/lib/ai/genaiClient.ts`. This gateway is **internal-network only**: it
only resolves on the HML network or VPN. A request from a server that isn't
on that network (including Vercel's default runtime) will time out rather
than fail cleanly, so AI features only work when the deploying server can
reach the HML network. `GENAI_MODEL` is required with no default - a wrong
or missing model id also fails as a timeout, not a clear error.

## Job sources

Job discovery is pluggable (`src/lib/jobs/sources/`, `JobSource` interface)
so adding a source is implementing one function and registering it in
`sources/index.ts`. Currently wired up:

- **Remotive** (`sources/remotive.ts`) - free, public, no API key needed,
  remote jobs only. Remotive's terms require crediting them and linking back
  to the original listing wherever it's shown, which every discovered job
  card does. Don't remove that attribution.

**LinkedIn is deliberately not a source and never will be built as a scrape.**
LinkedIn's Terms of Service explicitly prohibit scraping their job listings,
they actively detect and block it, and there's litigation history over
exactly this (hiQ Labs v. LinkedIn and others). The only legitimate path is
LinkedIn's official Talent/Jobs API, which requires a partner agreement with
LinkedIn directly - not something obtainable via self-service signup. If that
partnership is ever in place, add a `linkedin.ts` source implementing the
same `JobSource` interface; nothing else in the app needs to change.

Other real options if you want more coverage (each needs your own signup /
API key - see each provider's site): Adzuna, JSearch/RapidAPI, USAJobs (US
federal only), or per-company Greenhouse/Lever job board endpoints for
specific employers you want to track.

### Daily refresh

New listings aren't fetched per-user on demand - a Vercel Cron job
(`vercel.json`, `src/app/api/cron/refresh-jobs/route.ts`) runs once a day,
pulls from every registered source, upserts into the shared `jobs` table,
and deletes jobs older than 30 days that nobody has saved or applied to.
Users just browse/filter what's already in the DB, filtered against their
saved preferences - this is far friendlier to a source like Remotive, whose
terms ask for a handful of requests per day site-wide, not per user.

To enable it: set a `CRON_SECRET` (16+ random characters) as a Vercel
project environment variable. Vercel automatically sends it as
`Authorization: Bearer <value>` on every cron invocation, which the route
checks against `process.env.CRON_SECRET`. Cron jobs only run on deployed
Vercel projects, not locally - to test the route locally, call it manually
with the header set:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/refresh-jobs
```

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm run lint` - ESLint
- `npx tsc --noEmit` - type check

## Project structure

```
src/
  app/
    (auth)/        # login, signup, onboarding - unauthenticated shell
    (app)/         # dashboard, jobs, career DNA, applications, etc. - authenticated shell
    api/           # route handlers (auth callback, etc.)
  components/
    ui/            # shadcn/ui primitives
    app-shell/     # sidebar + top bar
    career-dna/    # experience/skills/evidence editors
    jobs/          # job paste form, analysis trigger
    applications/  # application pipeline UI
  lib/
    supabase/      # browser/server/admin clients + proxy (middleware) helper
    ai/            # versioned AI modules (job parser, job matcher, ...)
    actions/       # server actions
    validations/   # Zod schemas
    data/          # read-side data-fetching helpers
supabase/
  migrations/      # SQL schema + RLS policies
```

## Deployment

Deployed on Vercel. Set the same environment variables as `.env.example` in
the Vercel project settings (Production and Preview).
