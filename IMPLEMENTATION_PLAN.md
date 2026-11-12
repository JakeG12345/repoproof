# RepoProof Implementation Plan

## Milestones

1. Product foundation
   - Create the configurable brand, pricing and operating rules.
   - Define the strict evidence model, report schemas and validation rules.
   - Create Drizzle schema, SQL migration and documented tenant policies.

2. Safe analysis core
   - Implement GitHub URL validation, public API adapter, deterministic mock adapter and file-tree classifier.
   - Implement secret redaction, untrusted-content normalisation and prompt-injection guards.
   - Implement staged report generation that separates deterministic facts from model-assisted synthesis.

3. Functional local workflow
   - Persist roles, candidates, scans, reports, review actions, audit logs and invitations in local workspace storage.
   - Generate evidence-backed project maps, role-requirement coverage, interview plans and candidate response workflow from selected repositories.
   - Keep fixture-backed mock mode for tests and safety fixtures without presenting the product as a demo.

4. SaaS workflows
   - Implement public, auth, dashboard, role, candidate, scan, report, invitation, share, settings and admin routes.
   - Implement admin concierge queue, claim review states, audit logging model and report versioning.
   - Implement fake and production adapters for Stripe, GitHub App, OpenAI Responses, email, storage, analytics and background jobs.

5. Launch readiness
   - Implement integration endpoints, webhook verification, fake checkout, exports and operational docs.
   - Add automated tests for the evidence model, safety layer, GitHub validation, report engine and webhook handling.
   - Verify lint, typecheck, build and tests under Node 22.

## Acceptance Criteria

- The local app works without paid external services, and public GitHub mode works with unauthenticated GitHub API limits.
- A recruiter can move through role creation, candidate creation, repository selection, scan review and report/interview/export pages with persisted workspace data.
- Every material report claim references evidence or is clearly labelled as uncertain.
- Unsupported model claims are rejected.
- GitHub input accepts only exact GitHub usernames or GitHub URLs and rejects lookalike domains.
- Repository content is treated as untrusted and is not executed.
- Secrets are redacted before excerpts are persisted, displayed or sent to a model.
- Human-reviewed reports enter an admin queue and record reviewer action metadata.
- Pricing, brand and copy are configurable.
- Public pages do not use fake logos, fake testimonials or fake customer claims.
- Tests cover responsible-AI guardrails, malicious fixtures and deterministic report output.

## Technical Risks

- Current package compatibility now points to Node 22. Local Node 20.11 can install with warnings but should not be used for release validation.
- GitHub rate limits and pagination require production queueing and caching; mock mode covers deterministic testing only.
- Private repository analysis needs a registered GitHub App and careful token handling before launch.
- PDF export in the MVP is intentionally conservative and content-limited to avoid source-code republication.
- Supabase RLS policies require production verification against the final auth claims shape.

## Security Risks

- Prompt injection from repository content, commit messages, issue bodies or pull requests.
- Secret leakage from committed credentials in candidate repositories.
- Over-collection or over-retention of private code.
- Incorrect tenant isolation.
- Webhook replay or signature bypass.
- Misinterpretation of missing GitHub evidence as missing skill.

## Scope Exclusions

- No ATS integrations.
- No Chrome extension.
- No LinkedIn scraping or identity matching.
- No automated candidate discovery.
- No code execution or dependency installation for analysed repositories.
- No definitive authorship, dishonesty or AI-code detection claims.
- No public rankings, leaderboards, overall fit score or automated rejection workflow.
- No GitHub Enterprise Server support.
- No enterprise SSO.

## Launch-Critical Path

1. Run the app under Node 22.19+.
2. Configure Supabase Postgres and apply `db/migrations/0001_initial.sql`.
3. Register a read-only GitHub App using the documented callback, setup and webhook endpoints.
4. Add server-only environment variables from `.env.example`.
5. Configure Stripe products and placeholder price IDs, then verify webhook signatures in test mode.
6. Run `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build`.
7. Run one fixture-backed mock scan and one public GitHub API scan with a low-risk test repository.
8. Review data-retention settings and acceptable-use language with counsel before first paid customer.
