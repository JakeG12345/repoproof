# RepoProof

RepoProof turns an exact GitHub profile or repository URL into an evidence-backed technical interview brief. It is a decision-support product for technical recruiting workflows and does not generate employment recommendations.

## Current MVP

- Next.js 16 App Router, React 19, TypeScript strict mode and Tailwind CSS 4.
- Configurable brand, logo text, colours, copy and pricing in `src/lib/config.ts`.
- Strict evidence model and report validation in `src/lib/evidence.ts`.
- Persistent local workspace stored in `.repoproof-data/workspace.json`.
- Public GitHub API analysis by default, with deterministic fixture-backed mock mode available for tests.
- Prompt-injection and secret-redaction protections in `src/lib/safety.ts`.
- GitHub URL validation, file-tree classification and GitHub API/mock adapters.
- OpenAI Responses API adapter with structured Zod output plus deterministic mock mode.
- Stripe Checkout/webhook adapter plus local fake checkout.
- Admin concierge queue, report review, candidate context, export and share/invite flows.
- Drizzle schema and SQL migration for the requested data model.

## Local Setup

Use Node `22.19+`. The current OpenAI SDK, Supabase client, Vitest/Vite stack and some transitive dependencies require Node 22. This machine initially had Node 20.11, which installs with warnings but is not the release target.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

The default `APP_MODE=local` uses the public GitHub API and can run without a GitHub token, subject to GitHub rate limits. Set `APP_MODE=mock` when you need deterministic fixture-backed runs without GitHub, OpenAI, Stripe, Supabase or Resend credentials.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Database

Production uses PostgreSQL with Drizzle ORM. Apply `db/migrations/0001_initial.sql` to Supabase Postgres or another PostgreSQL database.

The migration enables row-level security on tenant-owned tables and uses `current_setting('app.organisation_id', true)` for tenant policies. Production request handling must set that value per database transaction after authenticating the user and organisation membership.

`drizzle-kit` is not installed in this MVP because npm audit currently flags its transitive `@esbuild-kit` path. Keep `db/schema.ts` and `db/migrations/*.sql` in sync manually until the upstream CLI path is clean.

## GitHub App Setup

Register a read-only GitHub App with:

- Callback URL: `/api/github/callback`
- Setup URL: `/api/github/setup`
- Webhook URL: `/api/github/webhook`
- Permissions: metadata read, contents read, pull requests read, issues read where required, actions read where required
- Events: installation, installation_repositories, repository, push, pull_request, release

Set these server-only variables:

```bash
GITHUB_APP_ID=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY_BASE64=
GITHUB_APP_WEBHOOK_SECRET=
GITHUB_PUBLIC_TOKEN=
```

Never expose installation tokens to browser code. Candidate installs should select only relevant repositories.

## OpenAI Setup

Set:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6
```

The adapter uses the official OpenAI server SDK, Responses API structured outputs and Zod validation. Repository text is passed only as delimited untrusted evidence and may reference only supplied evidence IDs.

## Stripe Setup

Create products and prices for the configurable plans, then set:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SINGLE_REPORT_PRICE_ID=
STRIPE_HUMAN_REVIEW_PRICE_ID=
STRIPE_STARTER_PRICE_ID=
STRIPE_TEAM_PRICE_ID=
STRIPE_FOUNDING_PILOT_PRICE_ID=
```

Webhook handling verifies signatures and allocates credits idempotently. Tests and mock mode do not process real payments.

## Security And Responsible-AI Rules

- Do not execute analysed repository code.
- Do not scrape GitHub HTML.
- Treat repository content, README files, comments, issues, pull requests and commit messages as untrusted data.
- Redact likely credentials before display, storage or model use.
- Every material model-generated claim must reference an evidence ID.
- Do not infer protected characteristics, personality, intelligence, motivation, work ethic or cultural fit.
- Do not produce a hire/no-hire recommendation, overall fit score, fraud-risk label or AI-generated percentage.
- Always display: "Not observed is not equivalent to lacking the skill."

## Key Routes

- `/dashboard` recruiter workspace
- `/jobs/new` role and requirement editor
- `/candidates/new` candidate intake
- `/candidates/[candidateId]` repository selection and scan launch
- `/reports/[reportId]` generated report
- `/reports/[reportId]/interview` interview plans
- `/reports/[reportId]/export?format=pdf` PDF export
- `/admin/review` concierge review queue
- `/invite/[token]` candidate invitation
