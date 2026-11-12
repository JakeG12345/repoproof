import { z } from "zod";
import { appConfig } from "@/src/lib/config";

export const evidenceTypes = [
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
] as const;

export const observationTypes = [
  "observed",
  "candidate_claim",
  "recruiter_claim",
  "inferred",
  "ambiguous",
  "unknown",
  "not_observed",
] as const;

export const requirementStatuses = [
  "direct_evidence",
  "adjacent_evidence",
  "candidate_claim_only",
  "ambiguous",
  "not_observed",
  "not_assessable",
] as const;

export const confidenceValues = ["low", "medium", "high"] as const;

export const EvidenceItemSchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1),
  candidateId: z.string().min(1),
  scanId: z.string().min(1),
  repositoryId: z.string().min(1),
  category: z.string().min(1),
  claim: z.string().min(1),
  evidenceType: z.enum(evidenceTypes),
  observationType: z.enum(observationTypes),
  confidence: z.enum(confidenceValues),
  sourceUrl: z.string().url(),
  sourceKind: z.string().min(1),
  repositoryFullName: z.string().min(1),
  path: z.string().optional(),
  startLine: z.number().int().positive().optional(),
  endLine: z.number().int().positive().optional(),
  commitSha: z.string().optional(),
  pullRequestNumber: z.number().int().positive().optional(),
  issueNumber: z.number().int().positive().optional(),
  rawFact: z.record(z.string(), z.unknown()),
  interpretation: z.string().min(1),
  limitations: z.string().min(1),
  createdAt: z.string().datetime(),
  extractorVersion: z.string().min(1),
  modelRunId: z.string().optional(),
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const RoleRequirementSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  requiredLevel: z.enum(["required", "preferred"]),
  importance: z.enum(["low", "medium", "high"]),
  minimumEvidenceExpected: z.string(),
  recruiterNotes: z.string().optional(),
  reviewedByRecruiter: z.boolean(),
});

export type RoleRequirement = z.infer<typeof RoleRequirementSchema>;

export const ReportClaimSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  statement: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)),
  confidence: z.enum(confidenceValues),
  source: z.enum(["deterministic", "model", "candidate", "recruiter"]),
  limitations: z.string().min(1),
});

export type ReportClaim = z.infer<typeof ReportClaimSchema>;

export const InterviewQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "architecture_explanation",
    "trade_off_reasoning",
    "debugging",
    "testing_strategy",
    "data_modelling",
    "security",
    "scaling",
    "api_design",
    "frontend_state",
    "error_handling",
    "deployment",
    "refactoring",
    "team_contribution",
    "code_ownership",
    "project_retrospective",
  ]),
  level: z.enum(["introductory", "intermediate", "advanced"]),
  question: z.string().min(1),
  purpose: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)).min(1),
  expectedThemes: z.array(z.string().min(1)).min(1),
  followUps: z.array(z.string().min(1)),
  limitations: z.string().min(1),
});

export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;

export const RequirementEvidenceSchema = z.object({
  requirement: z.string().min(1),
  importance: z.enum(["low", "medium", "high"]),
  status: z.enum(requirementStatuses),
  evidenceIds: z.array(z.string().min(1)),
  confidence: z.enum(confidenceValues),
  repositories: z.array(z.string().min(1)),
  limitations: z.string().min(1),
  suggestedInterviewQuestion: z.string().min(1),
});

export type RequirementEvidence = z.infer<typeof RequirementEvidenceSchema>;

export const ProjectMapSchema = z.object({
  repositoryId: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  repositoryAge: z.string(),
  latestRelevantActivity: z.string(),
  primaryLanguages: z.array(z.string()),
  detectedFrameworks: z.array(z.string()),
  applicationType: z.string(),
  architectureSummary: z.string(),
  testsObserved: z.string(),
  cicdObserved: z.string(),
  deploymentObserved: z.string(),
  documentationObserved: z.string(),
  databaseEvidence: z.string(),
  apiEvidence: z.string(),
  candidateContributionEvidence: z.string(),
  limitations: z.string(),
  evidenceIds: z.array(z.string().min(1)).min(1),
  secondaryMetadata: z.record(z.string(), z.unknown()),
});

export type ProjectMap = z.infer<typeof ProjectMapSchema>;

export const AuthorshipProbeSchema = z.object({
  component: z.string().min(1),
  whySelected: z.string().min(1),
  sourceUrl: z.string().url(),
  evidenceIds: z.array(z.string().min(1)).min(1),
  questions: z.array(z.string().min(1)).min(1),
  expectedConcepts: z.array(z.string().min(1)).min(1),
  exercise: z.string().min(1),
  alternativeVerbalExercise: z.string().min(1),
  alternativeExplanations: z.array(z.string().min(1)).min(1),
  ownershipEvidenceConfidence: z.enum(confidenceValues),
});

export type AuthorshipProbe = z.infer<typeof AuthorshipProbeSchema>;

export const ReportSchema = z.object({
  id: z.string().min(1),
  context: z.object({
    candidateGithubHandle: z.string().min(1),
    selectedRepositories: z.array(z.string().min(1)),
    repositoryAccess: z.enum(["public", "candidate_authorised", "mixed"]),
    jobRole: z.string().min(1),
    reportDate: z.string().datetime(),
    reportVersion: z.string().min(1),
    evidenceVersion: z.string().min(1),
    dataCutoff: z.string().datetime(),
    candidateReviewed: z.boolean(),
    humanReviewed: z.boolean(),
    humanReviewedAt: z.string().datetime().optional(),
    reviewer: z.string().optional(),
  }),
  warning: z.literal(appConfig.product.reportWarning),
  publicEvidenceLabel: z.string().min(1),
  executiveBrief: z.array(z.string().min(1)).max(5),
  projectMap: z.array(ProjectMapSchema).min(1),
  contributionEvidence: z.array(ReportClaimSchema),
  engineeringPracticeEvidence: z.array(ReportClaimSchema),
  requirementMatrix: z.array(RequirementEvidenceSchema),
  authorshipVerificationPlan: z.array(AuthorshipProbeSchema),
  interviewPlans: z.record(
    z.enum(["15", "30", "45", "60"]),
    z.array(InterviewQuestionSchema),
  ),
  dataLimitations: z.array(z.string().min(1)).min(1),
  candidateResponses: z.array(
    z.object({
      findingId: z.string(),
      response: z.string(),
      status: z.enum(["pending", "accepted", "needs_review"]),
    }),
  ),
  claims: z.array(ReportClaimSchema),
});

export type Report = z.infer<typeof ReportSchema>;

const bannedReportPatterns = [
  /\bshould\s+(hire|reject)\s+(this\s+|the\s+)?candidate\b/i,
  /\b(candidate\s+)?should\s+be\s+(hired|rejected)\b/i,
  /\b(recommend|recommendation)\s+(hire|hiring|reject|rejection)\b/i,
  /\bstrong candidate\b/i,
  /\bfraud risk\b/i,
  /\bai likelihood\b/i,
  /\bprobably used ai\b/i,
  /\bcandidate is lying\b/i,
  /\bcode is fake\b/i,
  /\bwork ethic\b/i,
  /\bpersonality\b/i,
  /\bintelligence\b/i,
  /\bcultural fit\b/i,
];

export function validateReportEvidenceReferences(report: Report, evidence: EvidenceItem[]) {
  const evidenceIds = new Set(evidence.map((item) => item.id));
  const unsupported: string[] = [];
  const checkIds = (owner: string, ids: string[]) => {
    if (ids.length === 0) unsupported.push(`${owner} has no evidence IDs`);
    for (const id of ids) {
      if (!evidenceIds.has(id)) unsupported.push(`${owner} references unknown evidence ID ${id}`);
    }
  };

  for (const claim of report.claims) checkIds(claim.id, claim.evidenceIds);
  for (const claim of report.contributionEvidence) checkIds(claim.id, claim.evidenceIds);
  for (const claim of report.engineeringPracticeEvidence) checkIds(claim.id, claim.evidenceIds);
  for (const project of report.projectMap) checkIds(project.name, project.evidenceIds);
  for (const requirement of report.requirementMatrix) checkIds(requirement.requirement, requirement.evidenceIds);
  for (const probe of report.authorshipVerificationPlan) checkIds(probe.component, probe.evidenceIds);
  for (const questions of Object.values(report.interviewPlans)) {
    for (const question of questions) checkIds(question.id, question.evidenceIds);
  }

  const reportText = JSON.stringify(report).toLowerCase();
  const banned = bannedReportPatterns
    .filter((pattern) => pattern.test(reportText))
    .map((pattern) => pattern.source);
  if (banned.length > 0) {
    unsupported.push(`Report contains prohibited wording: ${banned.join(", ")}`);
  }

  if (unsupported.length > 0) {
    throw new Error(`Unsupported report claims rejected: ${unsupported.join("; ")}`);
  }

  return true;
}

export function assertEvidenceItem(input: unknown) {
  return EvidenceItemSchema.parse(input);
}

export function assertReport(input: unknown, evidence: EvidenceItem[]) {
  const report = ReportSchema.parse(input);
  validateReportEvidenceReferences(report, evidence);
  return report;
}
