CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE member_role AS ENUM ('owner', 'admin', 'reviewer', 'recruiter', 'candidate');
CREATE TYPE scan_status AS ENUM ('queued', 'fetching', 'analysing', 'awaiting_context', 'awaiting_review', 'revision_required', 'approved', 'delivered', 'failed', 'deleted');
CREATE TYPE evidence_type AS ENUM ('repository_metadata', 'file_presence', 'file_excerpt', 'manifest', 'configuration', 'commit', 'commit_diff', 'pull_request', 'pull_request_review', 'issue', 'release', 'workflow', 'candidate_context', 'recruiter_context', 'deterministic_metric', 'model_inference');
CREATE TYPE observation_type AS ENUM ('observed', 'candidate_claim', 'recruiter_claim', 'inferred', 'ambiguous', 'unknown', 'not_observed');
CREATE TYPE requirement_status AS ENUM ('direct_evidence', 'adjacent_evidence', 'candidate_claim_only', 'ambiguous', 'not_observed', 'not_assessable');
CREATE TYPE confidence AS ENUM ('low', 'medium', 'high');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  auth_provider_id text,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  retention_days integer NOT NULL DEFAULT 90,
  blind_review_default boolean NOT NULL DEFAULT true,
  lawful_review_process text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE organisation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role member_role NOT NULL DEFAULT 'recruiter',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, user_id)
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  created_by_user_id uuid REFERENCES users(id),
  title text NOT NULL,
  job_description text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE role_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  role_id uuid NOT NULL REFERENCES roles(id),
  name text NOT NULL,
  category text NOT NULL,
  required_level text NOT NULL DEFAULT 'required',
  importance text NOT NULL DEFAULT 'medium',
  minimum_evidence_expected text,
  recruiter_notes text,
  reviewed_by_recruiter boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  neutral_identifier text NOT NULL,
  github_handle text,
  display_name text,
  candidate_email text,
  blind_review boolean NOT NULL DEFAULT true,
  deletion_requested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidate_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  repository_full_name text,
  role_description text,
  solo_or_team text,
  time_period text,
  features_contributed text,
  history_notes text,
  template_notes text,
  private_work_notes text,
  ai_use_disclosure text,
  share_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidate_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  consent_text_version text NOT NULL,
  consented_at timestamptz,
  revoked_at timestamptz,
  data_shared_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidate_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  created_by_user_id uuid REFERENCES users(id),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  opened_at timestamptz,
  completed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE github_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  candidate_id uuid REFERENCES candidates(id),
  github_user_id text NOT NULL,
  login text NOT NULL,
  canonical_url text NOT NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE github_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid REFERENCES candidates(id),
  installation_id text NOT NULL UNIQUE,
  account_login text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  suspended_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE github_installation_repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  installation_id uuid NOT NULL REFERENCES github_installations(id),
  github_repository_id text NOT NULL,
  repository_full_name text NOT NULL,
  selected boolean NOT NULL DEFAULT false,
  access_removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (installation_id, github_repository_id)
);

CREATE TABLE repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid REFERENCES candidates(id),
  github_repository_id text,
  full_name text NOT NULL,
  canonical_url text NOT NULL,
  visibility text NOT NULL DEFAULT 'public',
  default_branch text,
  description text,
  is_fork boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  is_template boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, full_name)
);

CREATE TABLE repository_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  repository_id uuid NOT NULL REFERENCES repositories(id),
  scan_id uuid,
  tree_hash text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  role_id uuid REFERENCES roles(id),
  created_by_user_id uuid REFERENCES users(id),
  status scan_status NOT NULL DEFAULT 'queued',
  scan_mode text NOT NULL DEFAULT 'public',
  canonical_github_url text NOT NULL,
  selected_repository_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_cutoff timestamptz NOT NULL DEFAULT now(),
  extractor_version text NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE scan_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  scan_id uuid NOT NULL REFERENCES scans(id),
  status scan_status NOT NULL DEFAULT 'queued',
  attempts integer NOT NULL DEFAULT 0,
  run_after timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE model_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  scan_id uuid NOT NULL REFERENCES scans(id),
  provider text NOT NULL,
  model text NOT NULL,
  prompt_version text NOT NULL,
  input_token_count integer NOT NULL DEFAULT 0,
  output_token_count integer NOT NULL DEFAULT 0,
  estimated_cost_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE source_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  scan_id uuid NOT NULL REFERENCES scans(id),
  repository_id uuid REFERENCES repositories(id),
  source_kind text NOT NULL,
  source_url text NOT NULL,
  path text,
  redacted_excerpt text,
  content_hash text,
  expires_at timestamptz,
  raw_deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE evidence_items (
  id text PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  scan_id uuid NOT NULL REFERENCES scans(id),
  repository_id uuid NOT NULL REFERENCES repositories(id),
  category text NOT NULL,
  claim text NOT NULL,
  evidence_type evidence_type NOT NULL,
  observation_type observation_type NOT NULL,
  confidence confidence NOT NULL,
  source_url text NOT NULL,
  source_kind text NOT NULL,
  repository_full_name text NOT NULL,
  path text,
  start_line integer,
  end_line integer,
  commit_sha text,
  pull_request_number integer,
  issue_number integer,
  raw_fact jsonb NOT NULL DEFAULT '{}'::jsonb,
  interpretation text NOT NULL,
  limitations text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  extractor_version text NOT NULL,
  model_run_id uuid REFERENCES model_runs(id)
);

CREATE TABLE contribution_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  scan_id uuid NOT NULL REFERENCES scans(id),
  repository_id uuid NOT NULL REFERENCES repositories(id),
  contribution_type text NOT NULL,
  source_url text NOT NULL,
  commit_sha text,
  pull_request_number integer,
  issue_number integer,
  occurred_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE report_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  scan_id uuid NOT NULL REFERENCES scans(id),
  version integer NOT NULL,
  status scan_status NOT NULL DEFAULT 'awaiting_review',
  report_version text NOT NULL,
  evidence_version text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  human_reviewed_at timestamptz,
  reviewer_user_id uuid REFERENCES users(id),
  candidate_reviewed_at timestamptz,
  warning_acknowledged_at timestamptz,
  share_token_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scan_id, version)
);

CREATE TABLE report_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  report_version_id uuid NOT NULL REFERENCES report_versions(id),
  section_key text NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE requirement_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  report_version_id uuid NOT NULL REFERENCES report_versions(id),
  role_requirement_id uuid REFERENCES role_requirements(id),
  requirement text NOT NULL,
  importance text NOT NULL,
  status requirement_status NOT NULL,
  confidence confidence NOT NULL,
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  repositories jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations text NOT NULL,
  suggested_interview_question text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE interview_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  report_version_id uuid NOT NULL REFERENCES report_versions(id),
  duration_minutes integer NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  interview_plan_id uuid NOT NULL REFERENCES interview_plans(id),
  question_type text NOT NULL,
  question text NOT NULL,
  purpose text NOT NULL,
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_themes jsonb NOT NULL DEFAULT '[]'::jsonb,
  follow_ups jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidate_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  report_version_id uuid REFERENCES report_versions(id),
  evidence_item_id text REFERENCES evidence_items(id),
  response_type text NOT NULL,
  response_text text NOT NULL,
  requested_deletion boolean NOT NULL DEFAULT false,
  approved_sharing boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admin_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  report_version_id uuid NOT NULL REFERENCES report_versions(id),
  reviewer_user_id uuid REFERENCES users(id),
  status scan_status NOT NULL DEFAULT 'awaiting_review',
  reviewer_notes text,
  unsupported_claims_removed integer NOT NULL DEFAULT 0,
  low_confidence_claims_reviewed integer NOT NULL DEFAULT 0,
  ready_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  user_id uuid REFERENCES users(id),
  stripe_checkout_session_id text,
  plan_key text NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'AUD',
  credits_allocated integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  stripe_subscription_id text,
  plan_key text NOT NULL,
  status text NOT NULL,
  monthly_report_allowance integer NOT NULL DEFAULT 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE usage_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  source_id uuid,
  event_type text NOT NULL,
  quantity integer NOT NULL,
  balance_after integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  provider text NOT NULL,
  delivery_id text NOT NULL,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  status text NOT NULL DEFAULT 'received',
  body_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, delivery_id)
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  actor_user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE retention_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  due_at timestamptz NOT NULL,
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  candidate_id uuid REFERENCES candidates(id),
  requested_by_user_id uuid REFERENCES users(id),
  request_source text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  user_id uuid REFERENCES users(id),
  event_name text NOT NULL,
  anonymous_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  report_version_id uuid NOT NULL REFERENCES report_versions(id),
  token_hash text NOT NULL UNIQUE,
  audience text NOT NULL DEFAULT 'recruiter',
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX roles_org_idx ON roles(organisation_id);
CREATE INDEX candidates_org_idx ON candidates(organisation_id);
CREATE INDEX scans_candidate_idx ON scans(candidate_id);
CREATE INDEX evidence_items_scan_idx ON evidence_items(scan_id);
CREATE INDEX analytics_events_name_idx ON analytics_events(event_name);

ALTER TABLE organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_installation_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY organisation_member_self ON organisation_members
  USING (organisation_id::text = current_setting('app.organisation_id', true));

CREATE POLICY tenant_isolation_roles ON roles
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_role_requirements ON role_requirements
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_candidates ON candidates
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_candidate_context ON candidate_context
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_candidate_consents ON candidate_consents
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_candidate_invitations ON candidate_invitations
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_github_accounts ON github_accounts
  USING (organisation_id IS NULL OR organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_github_installations ON github_installations
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_github_installation_repositories ON github_installation_repositories
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_repositories ON repositories
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_repository_snapshots ON repository_snapshots
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_scans ON scans
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_scan_jobs ON scan_jobs
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_model_runs ON model_runs
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_source_artifacts ON source_artifacts
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_evidence_items ON evidence_items
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_contribution_records ON contribution_records
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_report_versions ON report_versions
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_report_sections ON report_sections
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_requirement_evidence ON requirement_evidence
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_interview_plans ON interview_plans
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_interview_questions ON interview_questions
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_candidate_responses ON candidate_responses
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_admin_reviews ON admin_reviews
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_purchases ON purchases
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_subscriptions ON subscriptions
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_usage_ledger ON usage_ledger
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_webhook_deliveries ON webhook_deliveries
  USING (organisation_id IS NULL OR organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_retention_jobs ON retention_jobs
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_deletion_requests ON deletion_requests
  USING (organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_analytics_events ON analytics_events
  USING (organisation_id IS NULL OR organisation_id::text = current_setting('app.organisation_id', true));
CREATE POLICY tenant_isolation_share_links ON share_links
  USING (organisation_id::text = current_setting('app.organisation_id', true));
