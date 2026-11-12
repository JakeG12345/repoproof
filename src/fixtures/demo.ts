import type { EvidenceItem } from "@/src/lib/evidence";
import { appConfig } from "@/src/lib/config";

const now = "2026-08-05T00:00:00.000Z";
export const demoOrganisationId = "org_demo";
export const demoCandidateId = "cand_demo";
export const demoScanId = "scan_demo";

export type DemoContribution = {
  type: "commit" | "pull_request" | "review" | "issue" | "release";
  sourceUrl: string;
  title: string;
  occurredAt: string;
  commitSha?: string;
  pullRequestNumber?: number;
  issueNumber?: number;
  filesChanged?: string[];
  limitations: string;
};

export type DemoRepository = {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  visibility: "public" | "private";
  fork: boolean;
  archived: boolean;
  template: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  languages: Record<string, number>;
  topics: string[];
  canonicalUrl: string;
  fileTree: string[];
  excerpts: Array<{
    path: string;
    startLine: number;
    endLine: number;
    text: string;
    sourceUrl: string;
  }>;
  contributions: DemoContribution[];
  limitations: string[];
  secondaryMetadata: {
    stars: number;
    forks: number;
  };
};

export const demoCandidate = {
  neutralIdentifier: "Candidate RP-104",
  githubHandle: "synthetic-rp104",
  invitedBy: "Northstar Talent",
  jobRole: "Full-stack product engineer",
  reviewedByCandidate: false,
};

export const demoJobDescription = [
  "We need a full-stack product engineer with TypeScript, React, Next.js, API design, PostgreSQL, testing, CI and security judgement.",
  "Stripe or payments experience is useful. Python data automation experience is helpful but not required.",
].join("\n");

export const demoRepositories: DemoRepository[] = [
  {
    id: "repo_saas",
    owner: "synthetic-rp104",
    name: "ledgerline-saas",
    fullName: "synthetic-rp104/ledgerline-saas",
    visibility: "public",
    fork: false,
    archived: false,
    template: false,
    description: "A subscription billing workspace for small finance teams.",
    createdAt: "2025-01-11T09:00:00.000Z",
    updatedAt: "2026-07-28T18:15:00.000Z",
    pushedAt: "2026-07-28T18:15:00.000Z",
    defaultBranch: "main",
    languages: { TypeScript: 181450, CSS: 30220, JavaScript: 8130 },
    topics: ["nextjs", "stripe", "postgres", "billing"],
    canonicalUrl: "https://github.com/synthetic-rp104/ledgerline-saas",
    fileTree: [
      "package.json",
      "tsconfig.json",
      "app/api/stripe/webhook/route.ts",
      "app/api/invoices/route.ts",
      "app/dashboard/page.tsx",
      "db/schema.ts",
      "db/migrations/0001_initial.sql",
      "src/lib/billing/entitlements.ts",
      "src/lib/security/signature.ts",
      "tests/stripe-webhook.test.ts",
      ".github/workflows/ci.yml",
      "README.md",
      "Dockerfile",
    ],
    excerpts: [
      {
        path: "app/api/stripe/webhook/route.ts",
        startLine: 18,
        endLine: 44,
        sourceUrl:
          "https://github.com/synthetic-rp104/ledgerline-saas/blob/main/app/api/stripe/webhook/route.ts#L18-L44",
        text: "Verifies the Stripe signature, checks the event idempotency key and allocates report credits after checkout.session.completed.",
      },
      {
        path: "db/schema.ts",
        startLine: 7,
        endLine: 31,
        sourceUrl: "https://github.com/synthetic-rp104/ledgerline-saas/blob/main/db/schema.ts#L7-L31",
        text: "Defines organisation, subscription, purchase and usage ledger tables with organisation ids on tenant-owned records.",
      },
      {
        path: ".github/workflows/ci.yml",
        startLine: 1,
        endLine: 18,
        sourceUrl: "https://github.com/synthetic-rp104/ledgerline-saas/blob/main/.github/workflows/ci.yml#L1-L18",
        text: "Runs npm ci, lint, typecheck and Vitest on pull requests.",
      },
    ],
    contributions: [
      {
        type: "commit",
        sourceUrl: "https://github.com/synthetic-rp104/ledgerline-saas/commit/6f77ca1",
        title: "Add idempotent Stripe entitlement allocation",
        occurredAt: "2026-06-03T10:42:00.000Z",
        commitSha: "6f77ca1",
        filesChanged: ["app/api/stripe/webhook/route.ts", "src/lib/billing/entitlements.ts"],
        limitations: "Commit attribution is visible for this repository, but design ownership still requires interview discussion.",
      },
      {
        type: "pull_request",
        sourceUrl: "https://github.com/synthetic-rp104/ledgerline-saas/pull/42",
        title: "Separate checkout creation from webhook fulfilment",
        occurredAt: "2026-06-05T09:20:00.000Z",
        pullRequestNumber: 42,
        filesChanged: ["app/api/stripe/webhook/route.ts", "tests/stripe-webhook.test.ts"],
        limitations: "The pull request shows authored changes, not private planning context.",
      },
    ],
    limitations: ["Repository history is public and does not include any private product work that may have preceded it."],
    secondaryMetadata: { stars: 12, forks: 2 },
  },
  {
    id: "repo_python",
    owner: "synthetic-rp104",
    name: "batchsignal-pipeline",
    fullName: "synthetic-rp104/batchsignal-pipeline",
    visibility: "public",
    fork: false,
    archived: false,
    template: false,
    description: "Python automation that validates CSV exports and produces weekly account-health summaries.",
    createdAt: "2024-09-02T12:00:00.000Z",
    updatedAt: "2026-04-21T08:30:00.000Z",
    pushedAt: "2026-04-21T08:30:00.000Z",
    defaultBranch: "main",
    languages: { Python: 72200, Shell: 1200 },
    topics: ["python", "etl", "analytics"],
    canonicalUrl: "https://github.com/synthetic-rp104/batchsignal-pipeline",
    fileTree: [
      "pyproject.toml",
      "src/batchsignal/loaders.py",
      "src/batchsignal/validators.py",
      "src/batchsignal/reporting.py",
      "tests/test_validators.py",
      "tests/test_reporting.py",
      "docs/data-contract.md",
      "README.md",
    ],
    excerpts: [
      {
        path: "src/batchsignal/validators.py",
        startLine: 21,
        endLine: 57,
        sourceUrl:
          "https://github.com/synthetic-rp104/batchsignal-pipeline/blob/main/src/batchsignal/validators.py#L21-L57",
        text: "Validates required columns and date ranges before producing account-health summaries.",
      },
      {
        path: "src/batchsignal/reporting.py",
        startLine: 78,
        endLine: 109,
        sourceUrl:
          "https://github.com/synthetic-rp104/batchsignal-pipeline/blob/main/src/batchsignal/reporting.py#L78-L109",
        text: "Contains a long function combining grouping, formatting and delivery preparation, which is a maintainability discussion point.",
      },
    ],
    contributions: [
      {
        type: "commit",
        sourceUrl: "https://github.com/synthetic-rp104/batchsignal-pipeline/commit/bb9812e",
        title: "Add validation tests for account status imports",
        occurredAt: "2026-03-14T11:08:00.000Z",
        commitSha: "bb9812e",
        filesChanged: ["tests/test_validators.py", "src/batchsignal/validators.py"],
        limitations: "The public commit is attributed to the confirmed GitHub account.",
      },
    ],
    limitations: ["Several maintainability weaknesses are observable, but the repository may have been optimized for a small internal workflow."],
    secondaryMetadata: { stars: 3, forks: 0 },
  },
  {
    id: "repo_group",
    owner: "study-lab",
    name: "civic-portal-capstone",
    fullName: "study-lab/civic-portal-capstone",
    visibility: "public",
    fork: false,
    archived: false,
    template: true,
    description: "Group capstone portal for managing community-service intake forms.",
    createdAt: "2024-02-05T09:00:00.000Z",
    updatedAt: "2024-06-15T16:30:00.000Z",
    pushedAt: "2024-06-15T16:30:00.000Z",
    defaultBranch: "main",
    languages: { TypeScript: 93200, CSS: 24800 },
    topics: ["capstone", "template", "group-project"],
    canonicalUrl: "https://github.com/study-lab/civic-portal-capstone",
    fileTree: [
      "package.json",
      "src/pages/index.tsx",
      "src/components/IntakeForm.tsx",
      "src/components/AdminQueue.tsx",
      "src/lib/validation.ts",
      "README.md",
      "generated/api-client.ts",
      "public/logo.svg",
    ],
    excerpts: [
      {
        path: "src/components/IntakeForm.tsx",
        startLine: 33,
        endLine: 71,
        sourceUrl:
          "https://github.com/study-lab/civic-portal-capstone/blob/main/src/components/IntakeForm.tsx#L33-L71",
        text: "Shows form validation and accessible error messages, but history is mostly contained in one large initial commit.",
      },
    ],
    contributions: [
      {
        type: "commit",
        sourceUrl: "https://github.com/study-lab/civic-portal-capstone/commit/1aa0210",
        title: "Initial capstone import",
        occurredAt: "2024-02-05T09:30:00.000Z",
        commitSha: "1aa0210",
        filesChanged: ["src/components/IntakeForm.tsx", "src/components/AdminQueue.tsx", "generated/api-client.ts"],
        limitations:
          "A large initial commit and template-derived files limit what can be attributed from public history alone.",
      },
      {
        type: "issue",
        sourceUrl: "https://github.com/study-lab/civic-portal-capstone/issues/18",
        title: "Clarify ownership of intake validation work",
        occurredAt: "2024-05-01T13:00:00.000Z",
        issueNumber: 18,
        limitations: "Issue discussion names multiple contributors and should be checked with candidate context.",
      },
    ],
    limitations: [
      "This is a group project with template-derived files and a large initial commit. Candidate context is needed before drawing a conclusion.",
    ],
    secondaryMetadata: { stars: 1, forks: 1 },
  },
];

export const demoCandidateContext = [
  {
    repositoryFullName: "synthetic-rp104/ledgerline-saas",
    role: "Solo project after a previous private prototype.",
    timePeriod: "January 2025 to July 2026",
    features: "Subscription workflow, tenant billing ledger, webhook idempotency and CI setup.",
    notes: "Candidate says early sketches were not preserved.",
  },
  {
    repositoryFullName: "study-lab/civic-portal-capstone",
    role: "Team project.",
    timePeriod: "February 2024 to June 2024",
    features: "Candidate reports working on form validation and accessibility pass.",
    notes: "History was imported from a classroom template, so public attribution is incomplete.",
  },
];

const baseEvidence = {
  organisationId: demoOrganisationId,
  candidateId: demoCandidateId,
  scanId: demoScanId,
  createdAt: now,
  extractorVersion: appConfig.product.extractorVersion,
};

export const demoEvidenceItems: EvidenceItem[] = [
  {
    ...baseEvidence,
    id: "evi_saas_metadata",
    repositoryId: "repo_saas",
    category: "repository_metadata",
    claim: "ledgerline-saas is a public TypeScript SaaS repository with Next.js, API routes, database schema, tests and CI configuration.",
    evidenceType: "repository_metadata",
    observationType: "observed",
    confidence: "high",
    sourceUrl: "https://github.com/synthetic-rp104/ledgerline-saas",
    sourceKind: "repository",
    repositoryFullName: "synthetic-rp104/ledgerline-saas",
    rawFact: {
      languages: ["TypeScript", "CSS", "JavaScript"],
      treeSignals: ["app/api/stripe/webhook/route.ts", "db/schema.ts", ".github/workflows/ci.yml"],
    },
    interpretation: "The repository structure supports a product-style SaaS architecture discussion.",
    limitations: "Public repository structure does not prove production usage or sole authorship.",
  },
  {
    ...baseEvidence,
    id: "evi_saas_stripe_webhook",
    repositoryId: "repo_saas",
    category: "payments_security",
    claim: "The SaaS repository contains a Stripe webhook route with signature verification and idempotent entitlement allocation.",
    evidenceType: "file_excerpt",
    observationType: "observed",
    confidence: "high",
    sourceUrl:
      "https://github.com/synthetic-rp104/ledgerline-saas/blob/main/app/api/stripe/webhook/route.ts#L18-L44",
    sourceKind: "file",
    repositoryFullName: "synthetic-rp104/ledgerline-saas",
    path: "app/api/stripe/webhook/route.ts",
    startLine: 18,
    endLine: 44,
    rawFact: { excerpt: "Stripe signature verification and idempotency key handling are present." },
    interpretation: "This is direct evidence for payments and webhook design topics.",
    limitations: "The excerpt does not prove the candidate personally designed the approach.",
  },
  {
    ...baseEvidence,
    id: "evi_saas_ci_tests",
    repositoryId: "repo_saas",
    category: "testing_ci",
    claim: "CI configuration runs lint, typecheck and Vitest, and tests exist for the Stripe webhook flow.",
    evidenceType: "workflow",
    observationType: "observed",
    confidence: "high",
    sourceUrl: "https://github.com/synthetic-rp104/ledgerline-saas/blob/main/.github/workflows/ci.yml#L1-L18",
    sourceKind: "workflow",
    repositoryFullName: "synthetic-rp104/ledgerline-saas",
    path: ".github/workflows/ci.yml",
    startLine: 1,
    endLine: 18,
    rawFact: { commands: ["npm ci", "npm run lint", "npm run typecheck", "npm run test"] },
    interpretation: "There is observable evidence of testing and CI practice.",
    limitations: "The system did not execute tests and does not measure coverage.",
  },
  {
    ...baseEvidence,
    id: "evi_saas_commit",
    repositoryId: "repo_saas",
    category: "candidate_contribution",
    claim: "A commit attributed by GitHub to the confirmed account changes Stripe entitlement allocation files.",
    evidenceType: "commit",
    observationType: "observed",
    confidence: "high",
    sourceUrl: "https://github.com/synthetic-rp104/ledgerline-saas/commit/6f77ca1",
    sourceKind: "commit",
    repositoryFullName: "synthetic-rp104/ledgerline-saas",
    commitSha: "6f77ca1",
    rawFact: { filesChanged: ["app/api/stripe/webhook/route.ts", "src/lib/billing/entitlements.ts"] },
    interpretation: "This supports, but does not fully prove, contribution to the billing workflow.",
    limitations: "Commit attribution can be incomplete and should be discussed with the candidate.",
  },
  {
    ...baseEvidence,
    id: "evi_python_metadata",
    repositoryId: "repo_python",
    category: "repository_metadata",
    claim: "batchsignal-pipeline is a Python automation repository with modules, tests and documentation.",
    evidenceType: "repository_metadata",
    observationType: "observed",
    confidence: "high",
    sourceUrl: "https://github.com/synthetic-rp104/batchsignal-pipeline",
    sourceKind: "repository",
    repositoryFullName: "synthetic-rp104/batchsignal-pipeline",
    rawFact: { treeSignals: ["src/batchsignal/validators.py", "tests/test_validators.py", "docs/data-contract.md"] },
    interpretation: "This is direct evidence for Python automation and validation discussions.",
    limitations: "Static structure does not show runtime reliability.",
  },
  {
    ...baseEvidence,
    id: "evi_python_maintainability",
    repositoryId: "repo_python",
    category: "maintainability",
    claim: "A reporting module contains a long combined processing and formatting function that would be useful to discuss.",
    evidenceType: "file_excerpt",
    observationType: "observed",
    confidence: "medium",
    sourceUrl:
      "https://github.com/synthetic-rp104/batchsignal-pipeline/blob/main/src/batchsignal/reporting.py#L78-L109",
    sourceKind: "file",
    repositoryFullName: "synthetic-rp104/batchsignal-pipeline",
    path: "src/batchsignal/reporting.py",
    startLine: 78,
    endLine: 109,
    rawFact: { observation: "Long function combines grouping, formatting and delivery preparation." },
    interpretation: "This gives an interview opening for refactoring and maintainability trade-offs.",
    limitations: "It may reflect pragmatic scope constraints rather than poor engineering judgement.",
  },
  {
    ...baseEvidence,
    id: "evi_group_ambiguous",
    repositoryId: "repo_group",
    category: "ownership_limitations",
    claim: "civic-portal-capstone has limited candidate-attributed history, a large initial commit and template-derived files.",
    evidenceType: "deterministic_metric",
    observationType: "ambiguous",
    confidence: "high",
    sourceUrl: "https://github.com/study-lab/civic-portal-capstone",
    sourceKind: "repository",
    repositoryFullName: "study-lab/civic-portal-capstone",
    rawFact: {
      template: true,
      candidateAttributedCommitCount: 1,
      generatedPathsExcluded: ["generated/api-client.ts"],
    },
    interpretation: "Contribution depth is not fully established from public history.",
    limitations:
      "Squash merges, classroom imports, team processes or unlinked emails may explain weak visible attribution.",
  },
  {
    ...baseEvidence,
    id: "evi_candidate_context_group",
    repositoryId: "repo_group",
    category: "candidate_context",
    claim: "Candidate context says the group project began from a template and their reported focus was validation and accessibility.",
    evidenceType: "candidate_context",
    observationType: "candidate_claim",
    confidence: "medium",
    sourceUrl: "https://repoproof.local/invite/demo-token",
    sourceKind: "candidate_context",
    repositoryFullName: "study-lab/civic-portal-capstone",
    rawFact: {
      role: "Team project",
      reportedFocus: ["form validation", "accessibility pass"],
      templateUse: true,
    },
    interpretation: "Candidate context helps frame the ambiguous history but remains unverified.",
    limitations: "Candidate-provided context should be discussed and corrected if needed.",
  },
  {
    ...baseEvidence,
    id: "evi_data_limits",
    repositoryId: "repo_saas",
    category: "data_limitations",
    claim: "GitHub evidence is partial and cannot establish private work, team behaviour or complete authorship.",
    evidenceType: "deterministic_metric",
    observationType: "unknown",
    confidence: "high",
    sourceUrl: "https://repoproof.local/sample-report",
    sourceKind: "system_limitation",
    repositoryFullName: "synthetic-rp104/ledgerline-saas",
    rawFact: { limitation: "GitHub contains only part of a developer's work." },
    interpretation: "Report conclusions must remain limited and interview-grounded.",
    limitations: "Unknown information remains unknown until the candidate or other authorised sources provide context.",
  },
  {
    ...baseEvidence,
    id: "evi_requirement_not_observed",
    repositoryId: "repo_saas",
    category: "role_requirement_gap",
    claim: "Cloud infrastructure beyond Docker/Vercel-style deployment configuration was not observed in the selected repositories.",
    evidenceType: "deterministic_metric",
    observationType: "not_observed",
    confidence: "medium",
    sourceUrl: "https://github.com/synthetic-rp104/ledgerline-saas",
    sourceKind: "repository_tree",
    repositoryFullName: "synthetic-rp104/ledgerline-saas",
    rawFact: { inspectedSignals: ["Dockerfile"], absentSignals: ["terraform", "pulumi", "k8s"] },
    interpretation: "This is a useful interview topic if cloud infrastructure is role-critical.",
    limitations: "Not observed is not equivalent to lacking the skill.",
  },
];
