import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = (name = "id") =>
  uuid(name)
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const memberRole = pgEnum("member_role", [
  "owner",
  "admin",
  "reviewer",
  "recruiter",
  "candidate",
]);

export const scanStatus = pgEnum("scan_status", [
  "queued",
  "fetching",
  "analysing",
  "awaiting_context",
  "awaiting_review",
  "revision_required",
  "approved",
  "delivered",
  "failed",
  "deleted",
]);

export const evidenceType = pgEnum("evidence_type", [
  "repository_metadata",
  "file_presence",
  "file_excerpt",
  "manifest",
  "configuration",
  "commit",
  "commit_diff",
  "pull_request",
  "pull_request_review",
  "issue",
  "release",
  "workflow",
  "candidate_context",
  "recruiter_context",
  "deterministic_metric",
  "model_inference",
]);

export const observationType = pgEnum("observation_type", [
  "observed",
  "candidate_claim",
  "recruiter_claim",
  "inferred",
  "ambiguous",
  "unknown",
  "not_observed",
]);

export const requirementStatus = pgEnum("requirement_status", [
  "direct_evidence",
  "adjacent_evidence",
  "candidate_claim_only",
  "ambiguous",
  "not_observed",
  "not_assessable",
]);

export const confidence = pgEnum("confidence", [
  "low",
  "medium",
  "high",
]);

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  authProviderId: text("auth_provider_id"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}));

export const organisations = pgTable("organisations", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  retentionDays: integer("retention_days").notNull().default(90),
  blindReviewDefault: boolean("blind_review_default").notNull().default(true),
  lawfulReviewProcess: text("lawful_review_process"),
  ...timestamps,
}, (table) => ({
  slugIdx: uniqueIndex("organisations_slug_idx").on(table.slug),
}));

export const organisationMembers = pgTable("organisation_members", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: memberRole("role").notNull().default("recruiter"),
  ...timestamps,
}, (table) => ({
  orgUserIdx: uniqueIndex("organisation_members_org_user_idx").on(table.organisationId, table.userId),
}));

export const roles = pgTable("roles", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  title: text("title").notNull(),
  jobDescription: text("job_description"),
  status: text("status").notNull().default("draft"),
  ...timestamps,
}, (table) => ({
  orgIdx: index("roles_org_idx").on(table.organisationId),
}));

export const roleRequirements = pgTable("role_requirements", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  roleId: uuid("role_id").notNull().references(() => roles.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  requiredLevel: text("required_level").notNull().default("required"),
  importance: text("importance").notNull().default("medium"),
  minimumEvidenceExpected: text("minimum_evidence_expected"),
  recruiterNotes: text("recruiter_notes"),
  reviewedByRecruiter: boolean("reviewed_by_recruiter").notNull().default(false),
  ...timestamps,
}, (table) => ({
  roleIdx: index("role_requirements_role_idx").on(table.roleId),
}));

export const candidates = pgTable("candidates", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  neutralIdentifier: text("neutral_identifier").notNull(),
  githubHandle: text("github_handle"),
  displayName: text("display_name"),
  candidateEmail: text("candidate_email"),
  blindReview: boolean("blind_review").notNull().default(true),
  deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  orgIdx: index("candidates_org_idx").on(table.organisationId),
}));

export const candidateContext = pgTable("candidate_context", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id),
  repositoryFullName: text("repository_full_name"),
  roleDescription: text("role_description"),
  soloOrTeam: text("solo_or_team"),
  timePeriod: text("time_period"),
  featuresContributed: text("features_contributed"),
  historyNotes: text("history_notes"),
  templateNotes: text("template_notes"),
  privateWorkNotes: text("private_work_notes"),
  aiUseDisclosure: text("ai_use_disclosure"),
  shareApproved: boolean("share_approved").notNull().default(false),
  ...timestamps,
}, (table) => ({
  candidateIdx: index("candidate_context_candidate_idx").on(table.candidateId),
}));

export const candidateConsents = pgTable("candidate_consents", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id),
  consentTextVersion: text("consent_text_version").notNull(),
  consentedAt: timestamp("consented_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  dataSharedAt: timestamp("data_shared_at", { withTimezone: true }),
  ...timestamps,
});

export const candidateInvitations = pgTable("candidate_invitations", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  tokenIdx: uniqueIndex("candidate_invitations_token_hash_idx").on(table.tokenHash),
}));

export const githubAccounts = pgTable("github_accounts", {
  id: id(),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  candidateId: uuid("candidate_id").references(() => candidates.id),
  githubUserId: text("github_user_id").notNull(),
  login: text("login").notNull(),
  canonicalUrl: text("canonical_url").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  loginIdx: index("github_accounts_login_idx").on(table.login),
}));

export const githubInstallations = pgTable("github_installations", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").references(() => candidates.id),
  installationId: text("installation_id").notNull(),
  accountLogin: text("account_login").notNull(),
  permissions: jsonb("permissions").$type<Record<string, string>>().notNull().default(sql`'{}'::jsonb`),
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  removedAt: timestamp("removed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  installationIdx: uniqueIndex("github_installations_installation_idx").on(table.installationId),
}));

export const githubInstallationRepositories = pgTable("github_installation_repositories", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  installationId: uuid("installation_id").notNull().references(() => githubInstallations.id),
  githubRepositoryId: text("github_repository_id").notNull(),
  repositoryFullName: text("repository_full_name").notNull(),
  selected: boolean("selected").notNull().default(false),
  accessRemovedAt: timestamp("access_removed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  repoIdx: uniqueIndex("github_installation_repositories_unique_idx").on(table.installationId, table.githubRepositoryId),
}));

export const repositories = pgTable("repositories", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").references(() => candidates.id),
  githubRepositoryId: text("github_repository_id"),
  fullName: text("full_name").notNull(),
  canonicalUrl: text("canonical_url").notNull(),
  visibility: text("visibility").notNull().default("public"),
  defaultBranch: text("default_branch"),
  description: text("description"),
  isFork: boolean("is_fork").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  isTemplate: boolean("is_template").notNull().default(false),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  ...timestamps,
}, (table) => ({
  orgFullNameIdx: uniqueIndex("repositories_org_full_name_idx").on(table.organisationId, table.fullName),
}));

export const repositorySnapshots = pgTable("repository_snapshots", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  repositoryId: uuid("repository_id").notNull().references(() => repositories.id),
  scanId: uuid("scan_id"),
  treeHash: text("tree_hash"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  summary: jsonb("summary").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  rawDeletedAt: timestamp("raw_deleted_at", { withTimezone: true }),
  ...timestamps,
});

export const scans = pgTable("scans", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id),
  roleId: uuid("role_id").references(() => roles.id),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  status: scanStatus("status").notNull().default("queued"),
  scanMode: text("scan_mode").notNull().default("public"),
  canonicalGithubUrl: text("canonical_github_url").notNull(),
  selectedRepositoryIds: jsonb("selected_repository_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  dataCutoff: timestamp("data_cutoff", { withTimezone: true }).notNull().defaultNow(),
  extractorVersion: text("extractor_version").notNull(),
  errorMessage: text("error_message"),
  ...timestamps,
}, (table) => ({
  candidateIdx: index("scans_candidate_idx").on(table.candidateId),
}));

export const scanJobs = pgTable("scan_jobs", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  scanId: uuid("scan_id").notNull().references(() => scans.id),
  status: scanStatus("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  runAfter: timestamp("run_after", { withTimezone: true }).notNull().defaultNow(),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  ...timestamps,
});

export const modelRuns = pgTable("model_runs", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  scanId: uuid("scan_id").notNull().references(() => scans.id),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  promptVersion: text("prompt_version").notNull(),
  inputTokenCount: integer("input_token_count").notNull().default(0),
  outputTokenCount: integer("output_token_count").notNull().default(0),
  estimatedCostCents: integer("estimated_cost_cents").notNull().default(0),
  status: text("status").notNull().default("completed"),
  ...timestamps,
});

export const sourceArtifacts = pgTable("source_artifacts", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id),
  scanId: uuid("scan_id").notNull().references(() => scans.id),
  repositoryId: uuid("repository_id").references(() => repositories.id),
  sourceKind: text("source_kind").notNull(),
  sourceUrl: text("source_url").notNull(),
  path: text("path"),
  redactedExcerpt: text("redacted_excerpt"),
  contentHash: text("content_hash"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  rawDeletedAt: timestamp("raw_deleted_at", { withTimezone: true }),
  ...timestamps,
});

export const evidenceItems = pgTable("evidence_items", {
  id: text("id").primaryKey(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id),
  scanId: uuid("scan_id").notNull().references(() => scans.id),
  repositoryId: uuid("repository_id").notNull().references(() => repositories.id),
  category: text("category").notNull(),
  claim: text("claim").notNull(),
  evidenceType: evidenceType("evidence_type").notNull(),
  observationType: observationType("observation_type").notNull(),
  confidence: confidence("confidence").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceKind: text("source_kind").notNull(),
  repositoryFullName: text("repository_full_name").notNull(),
  path: text("path"),
  startLine: integer("start_line"),
  endLine: integer("end_line"),
  commitSha: text("commit_sha"),
  pullRequestNumber: integer("pull_request_number"),
  issueNumber: integer("issue_number"),
  rawFact: jsonb("raw_fact").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  interpretation: text("interpretation").notNull(),
  limitations: text("limitations").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  extractorVersion: text("extractor_version").notNull(),
  modelRunId: uuid("model_run_id").references(() => modelRuns.id),
}, (table) => ({
  reportEvidenceIdx: index("evidence_items_scan_idx").on(table.scanId),
}));

export const contributionRecords = pgTable("contribution_records", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id),
  scanId: uuid("scan_id").notNull().references(() => scans.id),
  repositoryId: uuid("repository_id").notNull().references(() => repositories.id),
  contributionType: text("contribution_type").notNull(),
  sourceUrl: text("source_url").notNull(),
  commitSha: text("commit_sha"),
  pullRequestNumber: integer("pull_request_number"),
  issueNumber: integer("issue_number"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  ...timestamps,
});

export const reportVersions = pgTable("report_versions", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id),
  scanId: uuid("scan_id").notNull().references(() => scans.id),
  version: integer("version").notNull(),
  status: scanStatus("status").notNull().default("awaiting_review"),
  reportVersion: text("report_version").notNull(),
  evidenceVersion: text("evidence_version").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  humanReviewedAt: timestamp("human_reviewed_at", { withTimezone: true }),
  reviewerUserId: uuid("reviewer_user_id").references(() => users.id),
  candidateReviewedAt: timestamp("candidate_reviewed_at", { withTimezone: true }),
  warningAcknowledgedAt: timestamp("warning_acknowledged_at", { withTimezone: true }),
  shareTokenHash: text("share_token_hash"),
  ...timestamps,
}, (table) => ({
  scanVersionIdx: uniqueIndex("report_versions_scan_version_idx").on(table.scanId, table.version),
}));

export const reportSections = pgTable("report_sections", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  reportVersionId: uuid("report_version_id").notNull().references(() => reportVersions.id),
  sectionKey: text("section_key").notNull(),
  title: text("title").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  orderIndex: integer("order_index").notNull().default(0),
  ...timestamps,
});

export const requirementEvidence = pgTable("requirement_evidence", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  reportVersionId: uuid("report_version_id").notNull().references(() => reportVersions.id),
  roleRequirementId: uuid("role_requirement_id").references(() => roleRequirements.id),
  requirement: text("requirement").notNull(),
  importance: text("importance").notNull(),
  status: requirementStatus("status").notNull(),
  confidence: confidence("confidence").notNull(),
  evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  repositories: jsonb("repositories").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  limitations: text("limitations").notNull(),
  suggestedInterviewQuestion: text("suggested_interview_question").notNull(),
  ...timestamps,
});

export const interviewPlans = pgTable("interview_plans", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  reportVersionId: uuid("report_version_id").notNull().references(() => reportVersions.id),
  durationMinutes: integer("duration_minutes").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  plan: jsonb("plan").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  ...timestamps,
});

export const interviewQuestions = pgTable("interview_questions", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  interviewPlanId: uuid("interview_plan_id").notNull().references(() => interviewPlans.id),
  questionType: text("question_type").notNull(),
  question: text("question").notNull(),
  purpose: text("purpose").notNull(),
  evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  expectedThemes: jsonb("expected_themes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  followUps: jsonb("follow_ups").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  limitations: text("limitations").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  ...timestamps,
});

export const candidateResponses = pgTable("candidate_responses", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id),
  reportVersionId: uuid("report_version_id").references(() => reportVersions.id),
  evidenceItemId: text("evidence_item_id").references(() => evidenceItems.id),
  responseType: text("response_type").notNull(),
  responseText: text("response_text").notNull(),
  requestedDeletion: boolean("requested_deletion").notNull().default(false),
  approvedSharing: boolean("approved_sharing").notNull().default(false),
  ...timestamps,
});

export const adminReviews = pgTable("admin_reviews", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  reportVersionId: uuid("report_version_id").notNull().references(() => reportVersions.id),
  reviewerUserId: uuid("reviewer_user_id").references(() => users.id),
  status: scanStatus("status").notNull().default("awaiting_review"),
  reviewerNotes: text("reviewer_notes"),
  unsupportedClaimsRemoved: integer("unsupported_claims_removed").notNull().default(0),
  lowConfidenceClaimsReviewed: integer("low_confidence_claims_reviewed").notNull().default(0),
  readyAt: timestamp("ready_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  ...timestamps,
});

export const purchases = pgTable("purchases", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  userId: uuid("user_id").references(() => users.id),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  planKey: text("plan_key").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("AUD"),
  creditsAllocated: integer("credits_allocated").notNull().default(0),
  status: text("status").notNull().default("pending"),
  ...timestamps,
});

export const subscriptions = pgTable("subscriptions", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planKey: text("plan_key").notNull(),
  status: text("status").notNull(),
  monthlyReportAllowance: integer("monthly_report_allowance").notNull().default(0),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  ...timestamps,
});

export const usageLedger = pgTable("usage_ledger", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  sourceId: uuid("source_id"),
  eventType: text("event_type").notNull(),
  quantity: integer("quantity").notNull(),
  balanceAfter: integer("balance_after"),
  notes: text("notes"),
  ...timestamps,
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: id(),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  provider: text("provider").notNull(),
  deliveryId: text("delivery_id").notNull(),
  eventType: text("event_type").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  status: text("status").notNull().default("received"),
  bodyHash: text("body_hash").notNull(),
  ...timestamps,
}, (table) => ({
  deliveryIdx: uniqueIndex("webhook_deliveries_provider_delivery_idx").on(table.provider, table.deliveryId),
}));

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const retentionJobs = pgTable("retention_jobs", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  status: text("status").notNull().default("queued"),
  ...timestamps,
});

export const deletionRequests = pgTable("deletion_requests", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  candidateId: uuid("candidate_id").references(() => candidates.id),
  requestedByUserId: uuid("requested_by_user_id").references(() => users.id),
  requestSource: text("request_source").notNull(),
  status: text("status").notNull().default("queued"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  notes: text("notes"),
  ...timestamps,
});

export const analyticsEvents = pgTable("analytics_events", {
  id: id(),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  userId: uuid("user_id").references(() => users.id),
  eventName: text("event_name").notNull(),
  anonymousId: text("anonymous_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  eventIdx: index("analytics_events_name_idx").on(table.eventName),
}));

export const shareLinks = pgTable("share_links", {
  id: id(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  reportVersionId: uuid("report_version_id").notNull().references(() => reportVersions.id),
  tokenHash: text("token_hash").notNull(),
  audience: text("audience").notNull().default("recruiter"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  tokenIdx: uniqueIndex("share_links_token_hash_idx").on(table.tokenHash),
}));
