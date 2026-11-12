import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { appConfig } from "@/src/lib/config";
import type { EvidenceItem, Report, RoleRequirement } from "@/src/lib/evidence";
import type { ContributionRecord, RepositoryDiscovery } from "@/src/lib/github/adapter";

export type LocalRole = {
  id: string;
  organisationId: string;
  title: string;
  jobDescription: string;
  requirements: RoleRequirement[];
  status: "draft" | "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type CandidateContextEntry = {
  repositoryFullName?: string;
  roleDescription: string;
  soloOrTeam: string;
  timePeriod: string;
  featuresContributed: string;
  historyNotes: string;
  templateNotes: string;
  privateWorkNotes: string;
  aiUseDisclosure: string;
  shareApproved: boolean;
  updatedAt: string;
};

export type LocalCandidate = {
  id: string;
  organisationId: string;
  roleId: string;
  neutralIdentifier: string;
  githubTarget: string;
  githubHandle: string;
  canonicalGithubUrl: string;
  targetKind: "profile" | "repository";
  blindReview: boolean;
  repositories: RepositoryDiscovery[];
  selectedRepositoryIds: string[];
  contextEntries: CandidateContextEntry[];
  createdAt: string;
  updatedAt: string;
};

export type LocalScan = {
  id: string;
  organisationId: string;
  candidateId: string;
  roleId: string;
  status:
    | "queued"
    | "fetching"
    | "analysing"
    | "awaiting_context"
    | "awaiting_review"
    | "revision_required"
    | "approved"
    | "delivered"
    | "failed"
    | "deleted";
  selectedRepositoryIds: string[];
  canonicalGithubUrl: string;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
};

export type LocalReportRecord = {
  id: string;
  organisationId: string;
  candidateId: string;
  roleId: string;
  scanId: string;
  status: "awaiting_review" | "revision_required" | "approved" | "delivered";
  version: number;
  report: Report;
  evidence: EvidenceItem[];
  generatedAt: string;
  humanReviewedAt?: string;
  reviewer?: string;
  updatedAt: string;
};

export type LocalAdminReview = {
  id: string;
  organisationId: string;
  reportId: string;
  status: LocalReportRecord["status"];
  reviewer?: string;
  reviewerNotes: string;
  unsupportedClaimsRemoved: number;
  lowConfidenceClaimsReviewed: number;
  updatedAt: string;
};

export type AuditLogEntry = {
  id: string;
  organisationId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type WorkspaceState = {
  organisation: {
    id: string;
    name: string;
    slug: string;
    reportCredits: number;
    retentionDays: number;
    blindReviewDefault: boolean;
  };
  roles: LocalRole[];
  candidates: LocalCandidate[];
  scans: LocalScan[];
  reports: LocalReportRecord[];
  adminReviews: LocalAdminReview[];
  auditLogs: AuditLogEntry[];
  candidateInvitations: Array<{
    id: string;
    candidateId: string;
    token: string;
    expiresAt: string;
    createdAt: string;
  }>;
};

const dataDir = path.join(process.cwd(), ".repoproof-data");
const dataFile = path.join(dataDir, "workspace.json");

let writeQueue = Promise.resolve();

export async function getWorkspace(): Promise<WorkspaceState> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const state = JSON.parse(raw) as WorkspaceState;
    if (isLegacySyntheticSeed(state)) {
      const next = initialWorkspace();
      await saveWorkspace(next);
      return next;
    }
    return state;
  } catch {
    const state = initialWorkspace();
    await saveWorkspace(state);
    return state;
  }
}

export async function saveWorkspace(state: WorkspaceState) {
  await mkdir(dataDir, { recursive: true });
  const tmp = `${dataFile}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(tmp, dataFile);
}

export async function mutateWorkspace<T>(mutation: (state: WorkspaceState) => T | Promise<T>) {
  let result: T;
  writeQueue = writeQueue.then(async () => {
    const state = await getWorkspace();
    result = await mutation(state);
    await saveWorkspace(state);
  });
  await writeQueue;
  return result!;
}

export async function resetWorkspace() {
  const state = initialWorkspace();
  await saveWorkspace(state);
  return state;
}

export function getRole(state: WorkspaceState, roleId?: string | null) {
  if (!roleId) return state.roles[0];
  return state.roles.find((role) => role.id === roleId);
}

export function getCandidate(state: WorkspaceState, candidateId?: string | null) {
  if (!candidateId) return state.candidates[0];
  return state.candidates.find((candidate) => candidate.id === candidateId);
}

export function getReportRecord(state: WorkspaceState, reportId?: string | null) {
  if (!reportId) return state.reports[0];
  return state.reports.find((report) => report.id === reportId);
}

export function isInvitationExpired(expiresAt?: string) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

export function addAudit(
  state: WorkspaceState,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  state.auditLogs.unshift({
    id: createId("audit"),
    organisationId: state.organisation.id,
    action,
    entityType,
    entityId,
    createdAt: new Date().toISOString(),
    metadata,
  });
  state.auditLogs = state.auditLogs.slice(0, 100);
}

export function selectedRepositoriesFor(candidate: LocalCandidate, selectedIds = candidate.selectedRepositoryIds) {
  const selected = new Set(selectedIds);
  return candidate.repositories.filter((repository) => selected.has(repository.id) || selected.has(repository.fullName));
}

export function contributionSummary(contributions: ContributionRecord[]) {
  const commits = contributions.filter((item) => item.type === "commit").length;
  const prs = contributions.filter((item) => item.type === "pull_request").length;
  const reviews = contributions.filter((item) => item.type === "review").length;
  const issues = contributions.filter((item) => item.type === "issue").length;
  return { commits, prs, reviews, issues, total: contributions.length };
}

function initialWorkspace(): WorkspaceState {
  const role: LocalRole = {
    id: "role_initial",
    organisationId: "org_local",
    title: "Full-stack product engineer",
    jobDescription:
      "We need a full-stack product engineer with TypeScript, React, Next.js, API design, PostgreSQL, testing, CI and security judgement. Stripe or payments experience is useful. Python data automation experience is helpful but not required.",
    requirements: [
      {
        id: "req_initial_1",
        name: "TypeScript, React and Next.js",
        category: "frontend",
        requiredLevel: "required",
        importance: "high",
        minimumEvidenceExpected: "Repository structure, package manifests, source files, routes or UI components.",
        recruiterNotes: "",
        reviewedByRecruiter: true,
      },
      {
        id: "req_initial_2",
        name: "API design and server-side application logic",
        category: "backend",
        requiredLevel: "required",
        importance: "high",
        minimumEvidenceExpected: "API routes, service modules, request validation, integration adapters or controller code.",
        recruiterNotes: "",
        reviewedByRecruiter: true,
      },
      {
        id: "req_initial_3",
        name: "PostgreSQL or relational data modelling",
        category: "data",
        requiredLevel: "required",
        importance: "medium",
        minimumEvidenceExpected: "Schema files, migrations, SQL, ORM models or data-access modules.",
        recruiterNotes: "",
        reviewedByRecruiter: true,
      },
      {
        id: "req_initial_4",
        name: "Testing and CI",
        category: "testing",
        requiredLevel: "required",
        importance: "medium",
        minimumEvidenceExpected: "Test files, test configuration, CI workflows or quality gates.",
        recruiterNotes: "",
        reviewedByRecruiter: true,
      },
      {
        id: "req_initial_5",
        name: "Security judgement",
        category: "security",
        requiredLevel: "preferred",
        importance: "medium",
        minimumEvidenceExpected: "Input validation, webhook verification, auth boundaries, secret handling or safe defaults.",
        recruiterNotes: "",
        reviewedByRecruiter: true,
      },
      {
        id: "req_initial_6",
        name: "Payments or Stripe experience",
        category: "integrations",
        requiredLevel: "preferred",
        importance: "low",
        minimumEvidenceExpected: "Payment provider integration, checkout flow, webhook handling or billing models.",
        recruiterNotes: "",
        reviewedByRecruiter: true,
      },
    ],
    status: "active",
    createdAt: "2026-08-05T00:00:00.000Z",
    updatedAt: "2026-08-05T00:00:00.000Z",
  };

  return {
    organisation: {
      id: "org_local",
      name: "Northstar Talent",
      slug: "northstar-talent",
      reportCredits: 10,
      retentionDays: appConfig.product.defaultRetentionDays,
      blindReviewDefault: true,
    },
    roles: [role],
    candidates: [],
    scans: [],
    reports: [],
    adminReviews: [],
    auditLogs: [
      {
        id: "audit_initial",
        organisationId: "org_local",
        action: "workspace_initialized",
        entityType: "workspace",
        entityId: "org_local",
        createdAt: "2026-08-05T00:00:00.000Z",
        metadata: {
          note: "Local workspace created. Add candidates with exact GitHub targets to generate reports.",
        },
      },
    ],
    candidateInvitations: [],
  };
}

function isLegacySyntheticSeed(state: WorkspaceState) {
  return (
    state.candidates.length === 1 &&
    state.candidates[0]?.id === "candidate_initial" &&
    state.candidates[0]?.githubHandle === "synthetic-rp104" &&
    state.reports.length === 1 &&
    state.reports[0]?.id === "report_initial"
  );
}
