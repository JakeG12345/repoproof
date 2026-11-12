"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createGitHubAdapter } from "@/src/lib/github/adapter";
import { extractRequirementsFromJobDescription } from "@/src/lib/requirements";
import { buildReportFromScan } from "@/src/lib/report-engine";
import {
  addAudit,
  createId,
  getCandidate,
  getRole,
  mutateWorkspace,
  resetWorkspace,
  selectedRepositoriesFor,
  type CandidateContextEntry,
  type LocalCandidate,
  type LocalRole,
  type LocalScan,
} from "@/src/lib/workspace-store";

const roleSchema = z.object({
  title: z.string().trim().min(2),
  jobDescription: z.string().trim().min(10),
});

const candidateSchema = z.object({
  roleId: z.string().min(1),
  neutralIdentifier: z.string().trim().min(2),
  githubTarget: z.string().trim().min(1),
});

const contextSchema = z.object({
  candidateId: z.string().min(1),
  repositoryFullName: z.string().optional(),
  roleDescription: z.string().trim().default(""),
  soloOrTeam: z.string().trim().default(""),
  timePeriod: z.string().trim().default(""),
  featuresContributed: z.string().trim().default(""),
  historyNotes: z.string().trim().default(""),
  templateNotes: z.string().trim().default(""),
  privateWorkNotes: z.string().trim().default(""),
  aiUseDisclosure: z.string().trim().default(""),
  shareApproved: z.boolean().default(false),
});

export async function createRoleAction(formData: FormData) {
  const parsed = roleSchema.parse({
    title: formData.get("title"),
    jobDescription: formData.get("jobDescription"),
  });
  let roleId = "";

  await mutateWorkspace((state) => {
    const now = new Date().toISOString();
    const role: LocalRole = {
      id: createId("role"),
      organisationId: state.organisation.id,
      title: parsed.title,
      jobDescription: parsed.jobDescription,
      requirements: extractRequirementsFromJobDescription(parsed.jobDescription).map((requirement) => ({
        ...requirement,
        id: createId("req"),
        reviewedByRecruiter: true,
      })),
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    roleId = role.id;
    state.roles.unshift(role);
    addAudit(state, "role_created", "role", role.id, { title: role.title });
  });

  revalidatePath("/jobs");
  redirect(`/jobs/${roleId}`);
}

export async function createCandidateAction(formData: FormData) {
  const parsed = candidateSchema.parse({
    roleId: formData.get("roleId"),
    neutralIdentifier: formData.get("neutralIdentifier"),
    githubTarget: formData.get("githubTarget"),
  });
  const github = createGitHubAdapter();
  const target = await github.validateTarget(parsed.githubTarget);
  const repositories = await github.discoverRepositories(target);
  const selectedRepositoryIds = suggestRepositorySelection(repositories);
  let candidateId = "";

  await mutateWorkspace((state) => {
    const role = getRole(state, parsed.roleId);
    if (!role) throw new Error("Selected role was not found.");
    const now = new Date().toISOString();
    const candidate: LocalCandidate = {
      id: createId("candidate"),
      organisationId: state.organisation.id,
      roleId: role.id,
      neutralIdentifier: parsed.neutralIdentifier,
      githubTarget: parsed.githubTarget,
      githubHandle: target.owner,
      canonicalGithubUrl: target.canonicalUrl,
      targetKind: target.kind,
      blindReview: state.organisation.blindReviewDefault,
      repositories,
      selectedRepositoryIds,
      contextEntries: [],
      createdAt: now,
      updatedAt: now,
    };
    candidateId = candidate.id;
    state.candidates.unshift(candidate);
    addAudit(state, "candidate_created", "candidate", candidate.id, {
      githubTarget: target.canonicalUrl,
      discoveredRepositories: repositories.length,
    });
  });

  revalidatePath("/candidates");
  redirect(`/candidates/${candidateId}`);
}

export async function saveCandidateContextAction(formData: FormData) {
  const parsed = contextSchema.parse({
    candidateId: formData.get("candidateId"),
    repositoryFullName: stringOrUndefined(formData.get("repositoryFullName")),
    roleDescription: formData.get("roleDescription") ?? "",
    soloOrTeam: formData.get("soloOrTeam") ?? "",
    timePeriod: formData.get("timePeriod") ?? "",
    featuresContributed: formData.get("featuresContributed") ?? "",
    historyNotes: formData.get("historyNotes") ?? "",
    templateNotes: formData.get("templateNotes") ?? "",
    privateWorkNotes: formData.get("privateWorkNotes") ?? "",
    aiUseDisclosure: formData.get("aiUseDisclosure") ?? "",
    shareApproved: formData.get("shareApproved") === "on",
  });

  await mutateWorkspace((state) => {
    const candidate = getCandidate(state, parsed.candidateId);
    if (!candidate) throw new Error("Candidate was not found.");
    const entry: CandidateContextEntry = {
      ...parsed,
      updatedAt: new Date().toISOString(),
    };
    candidate.contextEntries.unshift(entry);
    candidate.updatedAt = entry.updatedAt;
    addAudit(state, "candidate_context_added", "candidate", candidate.id, {
      repositoryFullName: entry.repositoryFullName,
      shareApproved: entry.shareApproved,
    });
  });

  revalidatePath(`/candidates/${parsed.candidateId}`);
  redirect(`/candidates/${parsed.candidateId}`);
}

export async function createScanAction(formData: FormData) {
  const candidateId = String(formData.get("candidateId") ?? "");
  const roleId = String(formData.get("roleId") ?? "");
  const selectedRepositoryIds = formData.getAll("repositoryIds").map(String).slice(0, 5);
  if (!candidateId || !roleId || selectedRepositoryIds.length === 0) {
    throw new Error("Select at least one repository before starting analysis.");
  }

  const result = await mutateWorkspace(async (state) => {
    const candidate = getCandidate(state, candidateId);
    const role = getRole(state, roleId);
    if (!candidate || !role) throw new Error("Candidate or role was not found.");
    const now = new Date().toISOString();
    candidate.selectedRepositoryIds = selectedRepositoryIds;
    candidate.updatedAt = now;
    const scan: LocalScan = {
      id: createId("scan"),
      organisationId: state.organisation.id,
      candidateId: candidate.id,
      roleId: role.id,
      status: "analysing",
      selectedRepositoryIds,
      canonicalGithubUrl: candidate.canonicalGithubUrl,
      startedAt: now,
    };
    state.scans.unshift(scan);

    const repositories = selectedRepositoriesFor(candidate, selectedRepositoryIds);
    const github = createGitHubAdapter();
    const contributions = await github.fetchContributionRecords(candidate.githubHandle, repositories.map((repo) => repo.fullName));
    scan.status = "awaiting_review";
    scan.completedAt = new Date().toISOString();

    const reportId = createId("report");
    const { report, evidence } = buildReportFromScan({
      reportId,
      organisationId: state.organisation.id,
      role,
      candidate,
      scan,
      repositories,
      contributions,
      contextEntries: candidate.contextEntries,
    });
    state.reports.unshift({
      id: reportId,
      organisationId: state.organisation.id,
      candidateId: candidate.id,
      roleId: role.id,
      scanId: scan.id,
      status: "awaiting_review",
      version: 1,
      report,
      evidence,
      generatedAt: report.context.reportDate,
      updatedAt: report.context.reportDate,
    });
    state.adminReviews.unshift({
      id: createId("review"),
      organisationId: state.organisation.id,
      reportId,
      status: "awaiting_review",
      reviewerNotes: "",
      unsupportedClaimsRemoved: 0,
      lowConfidenceClaimsReviewed: evidence.filter((item) => item.confidence !== "high").length,
      updatedAt: report.context.reportDate,
    });
    state.organisation.reportCredits = Math.max(0, state.organisation.reportCredits - 1);
    addAudit(state, "scan_completed", "scan", scan.id, {
      reportId,
      selectedRepositories: repositories.map((repository) => repository.fullName),
      evidenceItems: evidence.length,
    });
    return { reportId };
  });

  revalidatePath("/dashboard");
  redirect(`/reports/${result.reportId}`);
}

export async function reviewReportAction(formData: FormData) {
  const reportId = String(formData.get("reportId") ?? "");
  const action = String(formData.get("reviewAction") ?? "");
  const reviewerNotes = String(formData.get("reviewerNotes") ?? "");
  if (!reportId) throw new Error("Missing report id.");

  await mutateWorkspace((state) => {
    const report = state.reports.find((item) => item.id === reportId);
    const review = state.adminReviews.find((item) => item.reportId === reportId);
    if (!report || !review) throw new Error("Report was not found.");
    const now = new Date().toISOString();
    if (action === "approve") {
      report.status = "approved";
      report.humanReviewedAt = now;
      report.reviewer = "Local reviewer";
      report.report.context.humanReviewed = true;
      report.report.context.humanReviewedAt = now;
      report.report.context.reviewer = "Local reviewer";
      review.status = "approved";
      review.reviewer = "Local reviewer";
    } else if (action === "deliver") {
      report.status = "delivered";
      review.status = "delivered";
    } else if (action === "request_context") {
      report.status = "revision_required";
      review.status = "revision_required";
    } else {
      report.status = "awaiting_review";
      review.status = "awaiting_review";
    }
    review.reviewerNotes = reviewerNotes;
    review.updatedAt = now;
    report.updatedAt = now;
    addAudit(state, `report_${action || "reviewed"}`, "report", reportId, { reviewerNotes });
  });

  revalidatePath("/admin/review");
  revalidatePath(`/reports/${reportId}`);
  redirect(`/admin/review/${reportId}`);
}

export async function resetWorkspaceAction() {
  await resetWorkspace();
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

function suggestRepositorySelection(repositories: Array<{ id: string; fork: boolean; archived: boolean; classification: { sourceFiles: string[] } }>) {
  const suggested = repositories
    .filter((repository) => !repository.archived && (!repository.fork || repository.classification.sourceFiles.length > 5))
    .slice(0, 5)
    .map((repository) => repository.id);
  return suggested.length > 0 ? suggested : repositories.slice(0, 5).map((repository) => repository.id);
}

function stringOrUndefined(value: FormDataEntryValue | null) {
  const string = typeof value === "string" ? value.trim() : "";
  return string.length > 0 ? string : undefined;
}
