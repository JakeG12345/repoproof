import { appConfig } from "@/src/lib/config";
import {
  assertReport,
  type EvidenceItem,
  type InterviewQuestion,
  type Report,
  type ReportClaim,
  type RequirementEvidence,
} from "@/src/lib/evidence";
import { demoCandidate, demoEvidenceItems, demoRepositories } from "@/src/fixtures/demo";
import type { ContributionRecord, RepositoryDiscovery } from "@/src/lib/github/adapter";
import type { CandidateContextEntry, LocalCandidate, LocalRole, LocalScan } from "@/src/lib/workspace-store";

const dataLimitations = [
  "GitHub contains only part of a developer's work.",
  "Private professional work may not be visible.",
  "Commit attribution can be incomplete.",
  "Repository activity is not equivalent to skill or productivity.",
  "A public project may contain templates, libraries or team contributions.",
  "Static analysis does not demonstrate how someone works in a team.",
  "Not observed does not mean cannot do.",
];

export function buildDemoReport(evidence: EvidenceItem[] = demoEvidenceItems): Report {
  const claims: ReportClaim[] = [
    claim(
      "claim_saas_product",
      "executive_screening_brief",
      "The clearest observed evidence is a TypeScript SaaS repository with API routes, billing, tenant data modelling, tests and CI.",
      ["evi_saas_metadata", "evi_saas_stripe_webhook", "evi_saas_ci_tests"],
      "high",
      "model",
      "This conclusion is limited to the selected public repository and linked excerpts.",
    ),
    claim(
      "claim_python_supporting",
      "executive_screening_brief",
      "A Python automation project provides adjacent evidence for data validation and modular scripting.",
      ["evi_python_metadata"],
      "high",
      "model",
      "The repository does not establish production reliability.",
    ),
    claim(
      "claim_group_uncertain",
      "executive_screening_brief",
      "The group capstone is useful interview context, but visible ownership is ambiguous because of template-derived files and limited attribution.",
      ["evi_group_ambiguous", "evi_candidate_context_group"],
      "medium",
      "model",
      "Candidate context is needed before drawing a conclusion.",
    ),
    claim(
      "claim_cloud_gap",
      "executive_screening_brief",
      "Cloud infrastructure evidence is limited in the selected repositories and should be explored if role-critical.",
      ["evi_requirement_not_observed"],
      "medium",
      "model",
      appConfig.product.notObservedWarning,
    ),
  ];

  const report: Report = {
    id: "report_demo_v1",
    context: {
      candidateGithubHandle: demoCandidate.githubHandle,
      selectedRepositories: demoRepositories.map((repository) => repository.fullName),
      repositoryAccess: "public",
      jobRole: demoCandidate.jobRole,
      reportDate: "2026-08-05T00:00:00.000Z",
      reportVersion: appConfig.product.reportVersion,
      evidenceVersion: appConfig.product.evidenceVersion,
      dataCutoff: "2026-08-05T00:00:00.000Z",
      candidateReviewed: demoCandidate.reviewedByCandidate,
      humanReviewed: true,
      humanReviewedAt: "2026-08-05T03:15:00.000Z",
      reviewer: "Demo reviewer",
    },
    warning: appConfig.product.reportWarning,
    publicEvidenceLabel: appConfig.product.publicEvidenceLabel,
    executiveBrief: claims.map((item) => item.statement),
    projectMap: [
      {
        repositoryId: "repo_saas",
        name: "synthetic-rp104/ledgerline-saas",
        description: "Subscription billing workspace for small finance teams.",
        repositoryAge: "About 19 months at the report date.",
        latestRelevantActivity: "2026-07-28",
        primaryLanguages: ["TypeScript", "CSS", "JavaScript"],
        detectedFrameworks: ["Next.js", "Drizzle ORM", "Stripe", "GitHub Actions"],
        applicationType: "B2B SaaS web application",
        architectureSummary:
          "App Router pages, API routes, database schema, billing entitlement layer and CI workflow are visible.",
        testsObserved: "Vitest tests are present for webhook handling.",
        cicdObserved: "GitHub Actions workflow runs install, lint, typecheck and tests.",
        deploymentObserved: "Dockerfile is present; production deployment cannot be proven from static evidence.",
        documentationObserved: "README is present.",
        databaseEvidence: "Drizzle-style schema and initial migration are visible.",
        apiEvidence: "API route files include invoices and Stripe webhook handling.",
        candidateContributionEvidence:
          "A GitHub-attributed commit and pull request modify billing and webhook files.",
        limitations: "Public structure and commits do not prove sole authorship or production operation.",
        evidenceIds: ["evi_saas_metadata", "evi_saas_stripe_webhook", "evi_saas_ci_tests", "evi_saas_commit"],
        secondaryMetadata: { stars: 12, forks: 2, note: "Popularity metrics are secondary metadata only." },
      },
      {
        repositoryId: "repo_python",
        name: "synthetic-rp104/batchsignal-pipeline",
        description: "Python automation for validating exports and producing weekly summaries.",
        repositoryAge: "About 23 months at the report date.",
        latestRelevantActivity: "2026-04-21",
        primaryLanguages: ["Python", "Shell"],
        detectedFrameworks: ["pytest"],
        applicationType: "Data or automation project",
        architectureSummary: "Separate loader, validator and reporting modules with docs and tests are visible.",
        testsObserved: "pytest-style tests are visible for validators and reporting.",
        cicdObserved: "No CI workflow observed in selected files.",
        deploymentObserved: "No deployment configuration observed.",
        documentationObserved: "README and data-contract documentation are visible.",
        databaseEvidence: "No database or migration evidence observed.",
        apiEvidence: "No public API evidence observed.",
        candidateContributionEvidence: "A GitHub-attributed commit changes validation code and tests.",
        limitations: "Some maintainability issues are discussion topics, not definitive quality conclusions.",
        evidenceIds: ["evi_python_metadata", "evi_python_maintainability"],
        secondaryMetadata: { stars: 3, forks: 0, note: "Popularity metrics are secondary metadata only." },
      },
      {
        repositoryId: "repo_group",
        name: "study-lab/civic-portal-capstone",
        description: "Template-derived group capstone portal.",
        repositoryAge: "About 30 months at the report date.",
        latestRelevantActivity: "2024-06-15",
        primaryLanguages: ["TypeScript", "CSS"],
        detectedFrameworks: ["React"],
        applicationType: "Group project web application",
        architectureSummary: "Form and admin queue components are visible, with generated API client excluded.",
        testsObserved: "No test files observed in selected paths.",
        cicdObserved: "No CI workflow observed.",
        deploymentObserved: "No deployment configuration observed.",
        documentationObserved: "README is present.",
        databaseEvidence: "No migration or database schema evidence observed.",
        apiEvidence: "Generated API client was excluded from source-quality analysis.",
        candidateContributionEvidence:
          "Visible attribution is limited by a large initial commit and group-project context.",
        limitations: "Candidate context is needed before drawing a conclusion about contribution depth.",
        evidenceIds: ["evi_group_ambiguous", "evi_candidate_context_group"],
        secondaryMetadata: { stars: 1, forks: 1, note: "Popularity metrics are secondary metadata only." },
      },
    ],
    contributionEvidence: [
      claim(
        "claim_contribution_commit",
        "contribution_and_ownership",
        "A GitHub-attributed commit connects the candidate account to billing entitlement files.",
        ["evi_saas_commit"],
        "high",
        "deterministic",
        "Authorship and design depth should still be explored in interview.",
      ),
      claim(
        "claim_group_history",
        "contribution_and_ownership",
        "Contribution depth for the group capstone is not fully established from public history.",
        ["evi_group_ambiguous", "evi_candidate_context_group"],
        "medium",
        "model",
        "Large initial commits, template imports, group processes and unlinked emails can all affect attribution.",
      ),
    ],
    engineeringPracticeEvidence: [
      claim(
        "claim_practice_testing",
        "engineering_practice",
        "Testing and CI are directly observed in the SaaS repository.",
        ["evi_saas_ci_tests"],
        "high",
        "deterministic",
        "The system did not run the tests or measure coverage.",
      ),
      claim(
        "claim_practice_security",
        "engineering_practice",
        "Webhook signature verification and idempotency are observable security-conscious implementation signals.",
        ["evi_saas_stripe_webhook"],
        "high",
        "model",
        "Static evidence does not establish full security assurance.",
      ),
      claim(
        "claim_practice_refactor",
        "engineering_practice",
        "The Python reporting module gives a practical refactoring discussion topic.",
        ["evi_python_maintainability"],
        "medium",
        "model",
        "The structure may reflect appropriate trade-offs for a small workflow.",
      ),
    ],
    requirementMatrix: buildRequirementMatrix(),
    authorshipVerificationPlan: [
      {
        component: "Stripe webhook fulfilment",
        whySelected: "It combines payment security, idempotency and entitlement allocation.",
        sourceUrl:
          "https://github.com/synthetic-rp104/ledgerline-saas/blob/main/app/api/stripe/webhook/route.ts#L18-L44",
        evidenceIds: ["evi_saas_stripe_webhook", "evi_saas_commit"],
        questions: [
          "Walk through how duplicate webhook deliveries are handled.",
          "Why should entitlement allocation be driven by the webhook rather than the checkout return page?",
        ],
        expectedConcepts: ["signature verification", "idempotency", "event ordering", "credit allocation"],
        exercise:
          "Describe a 10 minute change to record and ignore duplicate checkout.session.completed events without executing the repository.",
        alternativeVerbalExercise:
          "Explain how the flow should behave if checkout succeeds but the browser closes before redirect.",
        alternativeExplanations: [
          "The candidate may have adapted a known Stripe pattern.",
          "The public commit may not capture earlier private design work.",
        ],
        ownershipEvidenceConfidence: "high",
      },
      {
        component: "Python reporting module",
        whySelected: "It has a visible maintainability trade-off suitable for practical discussion.",
        sourceUrl:
          "https://github.com/synthetic-rp104/batchsignal-pipeline/blob/main/src/batchsignal/reporting.py#L78-L109",
        evidenceIds: ["evi_python_maintainability"],
        questions: ["How would you split this reporting function if the pipeline gained more outputs?"],
        expectedConcepts: ["separation of concerns", "test seams", "data validation", "formatting boundaries"],
        exercise:
          "Outline a small refactor that separates aggregation from output formatting without running the project.",
        alternativeVerbalExercise: "Name the first unit tests you would write before changing the function.",
        alternativeExplanations: ["The combined function may have been acceptable for a small one-off automation."],
        ownershipEvidenceConfidence: "medium",
      },
      {
        component: "Capstone intake validation",
        whySelected: "The repository has useful UI evidence but ambiguous contribution history.",
        sourceUrl:
          "https://github.com/study-lab/civic-portal-capstone/blob/main/src/components/IntakeForm.tsx#L33-L71",
        evidenceIds: ["evi_group_ambiguous", "evi_candidate_context_group"],
        questions: ["Which validation cases did you personally work on, and how did the team divide the component?"],
        expectedConcepts: ["form validation", "accessible errors", "team contribution boundaries", "template constraints"],
        exercise: "Verbally add a validation rule and describe how the UI should expose the error accessibly.",
        alternativeVerbalExercise: "Explain how template imports changed the repository history.",
        alternativeExplanations: [
          "Squashed, imported or classroom-managed history can make real contributions hard to see.",
        ],
        ownershipEvidenceConfidence: "low",
      },
    ],
    interviewPlans: {
      "15": buildInterviewQuestions("15").slice(0, 3),
      "30": buildInterviewQuestions("30").slice(0, 5),
      "45": buildInterviewQuestions("45").slice(0, 7),
      "60": buildInterviewQuestions("60"),
    },
    dataLimitations,
    candidateResponses: [
      {
        findingId: "claim_group_history",
        response:
          "Candidate notes that the capstone was imported from a classroom template and asks reviewers to focus on validation work they can explain.",
        status: "needs_review",
      },
    ],
    claims,
  };

  return assertReport(report, evidence);
}

export function buildRequirementMatrix(): RequirementEvidence[] {
  return [
    {
      requirement: "TypeScript and React application development",
      importance: "high",
      status: "direct_evidence",
      evidenceIds: ["evi_saas_metadata"],
      confidence: "high",
      repositories: ["synthetic-rp104/ledgerline-saas", "study-lab/civic-portal-capstone"],
      limitations: "Presence of TypeScript files does not alone establish depth of understanding.",
      suggestedInterviewQuestion: "How is state and server-side data flow separated in the SaaS repository?",
    },
    {
      requirement: "API design and payment workflow",
      importance: "high",
      status: "direct_evidence",
      evidenceIds: ["evi_saas_stripe_webhook", "evi_saas_commit"],
      confidence: "high",
      repositories: ["synthetic-rp104/ledgerline-saas"],
      limitations: "Evidence supports discussion of structure, not sole design responsibility.",
      suggestedInterviewQuestion: "Why does webhook fulfilment need idempotency and signature verification?",
    },
    {
      requirement: "Testing and CI",
      importance: "high",
      status: "direct_evidence",
      evidenceIds: ["evi_saas_ci_tests"],
      confidence: "high",
      repositories: ["synthetic-rp104/ledgerline-saas"],
      limitations: "Coverage and reliability were not measured.",
      suggestedInterviewQuestion: "What failure cases should webhook tests cover beyond the current examples?",
    },
    {
      requirement: "Python data automation",
      importance: "medium",
      status: "adjacent_evidence",
      evidenceIds: ["evi_python_metadata", "evi_python_maintainability"],
      confidence: "medium",
      repositories: ["synthetic-rp104/batchsignal-pipeline"],
      limitations: "The role emphasises product engineering, so this is supporting rather than central evidence.",
      suggestedInterviewQuestion: "How would you make the reporting pipeline easier to extend safely?",
    },
    {
      requirement: "Cloud infrastructure",
      importance: "medium",
      status: "not_observed",
      evidenceIds: ["evi_requirement_not_observed"],
      confidence: "medium",
      repositories: ["synthetic-rp104/ledgerline-saas"],
      limitations: appConfig.product.notObservedWarning,
      suggestedInterviewQuestion: "What deployment or infrastructure work have you done that is not visible here?",
    },
    {
      requirement: "Team contribution clarity",
      importance: "medium",
      status: "ambiguous",
      evidenceIds: ["evi_group_ambiguous", "evi_candidate_context_group"],
      confidence: "medium",
      repositories: ["study-lab/civic-portal-capstone"],
      limitations: "Group project history is incomplete from public evidence alone.",
      suggestedInterviewQuestion: "Which parts of the capstone can you explain in detail, and what did teammates own?",
    },
  ];
}

export function buildInterviewQuestions(duration: "15" | "30" | "45" | "60" = "30"): InterviewQuestion[] {
  return [
    {
      id: `q_${duration}_webhook_architecture`,
      type: "architecture_explanation",
      level: "intermediate",
      question: "Walk through the payment webhook flow and where entitlement allocation happens.",
      purpose: "Tests understanding of asynchronous payment confirmation and idempotency.",
      evidenceIds: ["evi_saas_stripe_webhook", "evi_saas_commit"],
      expectedThemes: ["webhooks are authoritative", "signature verification", "idempotency", "credit ledger"],
      followUps: ["What happens if the same event is delivered twice?", "How would you replay a failed fulfilment safely?"],
      limitations: "The repository proves the structure exists but not who designed every detail.",
    },
    {
      id: `q_${duration}_testing`,
      type: "testing_strategy",
      level: "intermediate",
      question: "Which failure cases would you add to the webhook tests first?",
      purpose: "Tests practical reliability thinking tied to observed tests.",
      evidenceIds: ["evi_saas_ci_tests"],
      expectedThemes: ["invalid signatures", "duplicate delivery", "unknown customer", "failed entitlement allocation"],
      followUps: ["Which tests should be unit tests and which should use integration-style boundaries?"],
      limitations: "Static analysis did not execute or measure the test suite.",
    },
    {
      id: `q_${duration}_database`,
      type: "data_modelling",
      level: "advanced",
      question: "How would you model report credits so refunds can reverse usage safely?",
      purpose: "Tests data modelling and financial state reasoning.",
      evidenceIds: ["evi_saas_metadata", "evi_saas_stripe_webhook"],
      expectedThemes: ["append-only ledger", "idempotent events", "audit trail", "refund reversal"],
      followUps: ["How would monthly allowance reset work with one-off credits?"],
      limitations: "Evidence shows schema signals, not complete production billing operation.",
    },
    {
      id: `q_${duration}_python_refactor`,
      type: "refactoring",
      level: "intermediate",
      question: "How would you split the reporting function before adding a second output format?",
      purpose: "Tests maintainability judgement using a concrete file.",
      evidenceIds: ["evi_python_maintainability"],
      expectedThemes: ["aggregation boundary", "formatter boundary", "tests first", "small migration path"],
      followUps: ["What would you leave unchanged to reduce risk?"],
      limitations: "The file may reflect a constrained small-project decision.",
    },
    {
      id: `q_${duration}_group_ownership`,
      type: "code_ownership",
      level: "introductory",
      question: "Which capstone component can you explain most deeply, and what parts were teammate-owned?",
      purpose: "Clarifies ownership without presuming dishonesty.",
      evidenceIds: ["evi_group_ambiguous", "evi_candidate_context_group"],
      expectedThemes: ["clear contribution boundaries", "template use", "team process", "specific implementation details"],
      followUps: ["Can you point to the validation behaviour you remember changing?"],
      limitations: "Large initial commits and classroom templates can obscure attribution.",
    },
    {
      id: `q_${duration}_security`,
      type: "security",
      level: "advanced",
      question: "What secrets or identifiers should never be sent to client code in this sort of product?",
      purpose: "Tests security-conscious implementation thinking.",
      evidenceIds: ["evi_saas_stripe_webhook"],
      expectedThemes: ["webhook secret", "service role key", "installation token", "private key", "server-only handling"],
      followUps: ["How would you audit that a token never crosses a client boundary?"],
      limitations: "The report only observes selected source files.",
    },
    {
      id: `q_${duration}_cloud_gap`,
      type: "deployment",
      level: "introductory",
      question: "What deployment or cloud infrastructure work is not visible in these repositories?",
      purpose: "Explores a material evidence gap without treating absence as lack of ability.",
      evidenceIds: ["evi_requirement_not_observed"],
      expectedThemes: ["private work may be absent", "configuration examples", "runtime monitoring", "infrastructure trade-offs"],
      followUps: ["How would you deploy the SaaS repository for a small production pilot?"],
      limitations: appConfig.product.notObservedWarning,
    },
    {
      id: `q_${duration}_live_change`,
      type: "debugging",
      level: "intermediate",
      question: "Without running code, outline a small change to reject duplicate webhook events earlier.",
      purpose: "Creates a practical live-change exercise based on authorised material.",
      evidenceIds: ["evi_saas_stripe_webhook"],
      expectedThemes: ["read event id", "check delivery table", "transaction boundary", "return safe status"],
      followUps: ["What log entry would help diagnose replay attempts?"],
      limitations: "The exercise should stay verbal or static unless the repository owner authorises execution.",
    },
  ];
}

function claim(
  id: string,
  section: string,
  statement: string,
  evidenceIds: string[],
  confidence: "low" | "medium" | "high",
  source: "deterministic" | "model" | "candidate" | "recruiter",
  limitations: string,
): ReportClaim {
  return { id, section, statement, evidenceIds, confidence, source, limitations };
}

export const demoReport = buildDemoReport();

export function buildReportFromScan(input: {
  reportId: string;
  organisationId: string;
  role: LocalRole;
  candidate: LocalCandidate;
  scan: LocalScan;
  repositories: RepositoryDiscovery[];
  contributions: ContributionRecord[];
  contextEntries: CandidateContextEntry[];
}) {
  const createdAt = new Date().toISOString();
  const evidence = buildEvidenceFromScan(input, createdAt);
  const report = buildFunctionalReport(input, evidence, createdAt);
  return { report: assertReport(report, evidence), evidence };
}

function buildEvidenceFromScan(
  input: {
    organisationId: string;
    role: LocalRole;
    candidate: LocalCandidate;
    scan: LocalScan;
    repositories: RepositoryDiscovery[];
    contributions: ContributionRecord[];
    contextEntries: CandidateContextEntry[];
  },
  createdAt: string,
) {
  const evidence: EvidenceItem[] = [];

  for (const repository of input.repositories) {
    const base = evidenceBase(input, repository, createdAt);
    evidence.push({
      ...base,
      id: evidenceId("metadata", repository.id),
      category: "repository_metadata",
      claim: `${repository.fullName} is a ${repository.visibility} repository with ${Object.keys(repository.languages).join(", ") || "unknown"} language signals and classified project structure.`,
      evidenceType: "repository_metadata",
      observationType: "observed",
      confidence: "high",
      sourceUrl: repository.canonicalUrl,
      sourceKind: "repository",
      rawFact: {
        languages: repository.languages,
        topics: repository.topics,
        fork: repository.fork,
        archived: repository.archived,
        template: repository.template,
        stars: repository.stars,
        forks: repository.forks,
      },
      interpretation: "Repository metadata and file-tree signals can support project and interview preparation.",
      limitations: "Repository popularity metrics are secondary metadata only and are not quality signals.",
    });

    addPresenceEvidence(evidence, base, repository, "tests", repository.classification.tests, "testing", "test-file presence");
    addPresenceEvidence(evidence, base, repository, "workflow", repository.classification.workflows, "ci_cd", "CI workflow presence");
    addPresenceEvidence(evidence, base, repository, "docs", repository.classification.docs, "documentation", "documentation presence");
    addPresenceEvidence(evidence, base, repository, "api", repository.classification.apiRoutes, "api_design", "API route presence");
    addPresenceEvidence(evidence, base, repository, "database", repository.classification.migrations.concat(repository.classification.schemas), "data_modelling", "database or schema evidence");
    addPresenceEvidence(evidence, base, repository, "deployment", repository.classification.deployment, "deployment", "deployment configuration presence");

    if (repository.classification.generatedOrIgnored.length > 0) {
      evidence.push({
        ...base,
        id: evidenceId("ignored", repository.id),
        category: "analysis_scope",
        claim: `${repository.classification.generatedOrIgnored.length} generated, vendored, binary or unsafe paths were excluded from analysis for ${repository.fullName}.`,
        evidenceType: "deterministic_metric",
        observationType: "observed",
        confidence: "high",
        sourceUrl: repository.canonicalUrl,
        sourceKind: "repository_tree",
        rawFact: { excludedPaths: repository.classification.generatedOrIgnored.slice(0, 20) },
        interpretation: "The scanner down-weights generated or unsafe content and does not execute repository code.",
        limitations: "Excluding generated paths may omit relevant generated API contracts.",
      });
    }
  }

  for (const contribution of input.contributions) {
    const repository = input.repositories.find((item) => item.fullName === contribution.repositoryFullName);
    if (!repository) continue;
    evidence.push({
      ...evidenceBase(input, repository, createdAt),
      id: evidenceId(contribution.type, contribution.repositoryFullName, contribution.commitSha ?? contribution.pullRequestNumber ?? contribution.issueNumber ?? contribution.title),
      category: "candidate_contribution",
      claim: `GitHub API attribution found a ${contribution.type.replaceAll("_", " ")} for ${contribution.repositoryFullName}: ${contribution.title}.`,
      evidenceType:
        contribution.type === "commit"
          ? "commit"
          : contribution.type === "pull_request"
            ? "pull_request"
            : contribution.type === "review"
              ? "pull_request_review"
              : contribution.type === "issue"
                ? "issue"
                : "release",
      observationType: "observed",
      confidence: "high",
      sourceUrl: contribution.sourceUrl,
      sourceKind: contribution.type,
      commitSha: contribution.commitSha,
      pullRequestNumber: contribution.pullRequestNumber,
      issueNumber: contribution.issueNumber,
      rawFact: {
        title: contribution.title,
        occurredAt: contribution.occurredAt,
        filesChanged: contribution.filesChanged ?? [],
      },
      interpretation: "This supports contribution discussion using GitHub-supported attribution.",
      limitations: contribution.limitations,
    });
  }

  for (const repository of input.repositories) {
    const contributionCount = input.contributions.filter((item) => item.repositoryFullName === repository.fullName).length;
    if (contributionCount > 0) continue;
    evidence.push({
      ...evidenceBase(input, repository, createdAt),
      id: evidenceId("no_contrib", repository.id),
      category: "ownership_limitations",
      claim: `No GitHub API-attributed commits, pull requests, reviews, issues or releases were found for ${repository.fullName} in this scan sample.`,
      evidenceType: "deterministic_metric",
      observationType: "ambiguous",
      confidence: "medium",
      sourceUrl: repository.canonicalUrl,
      sourceKind: "contribution_search",
      rawFact: { contributionCount },
      interpretation: "Contribution depth is not fully established from the visible history.",
      limitations:
        "Squash merges, imported history, private previous repositories, template use, renamed accounts or unlinked commit emails may explain weak visible attribution.",
    });
  }

  for (const context of input.contextEntries) {
    const repository =
      input.repositories.find((item) => item.fullName === context.repositoryFullName) ?? input.repositories[0];
    if (!repository) continue;
    evidence.push({
      ...evidenceBase(input, repository, createdAt),
      id: evidenceId("context", repository.id, context.updatedAt),
      category: "candidate_context",
      claim: `Candidate-provided context was recorded for ${context.repositoryFullName ?? "the selected repositories"}.`,
      evidenceType: "candidate_context",
      observationType: "candidate_claim",
      confidence: "medium",
      sourceUrl: `${input.candidate.canonicalGithubUrl}`,
      sourceKind: "candidate_context",
      rawFact: {
        roleDescription: context.roleDescription,
        soloOrTeam: context.soloOrTeam,
        timePeriod: context.timePeriod,
        featuresContributed: context.featuresContributed,
        historyNotes: context.historyNotes,
        templateNotes: context.templateNotes,
        privateWorkNotes: context.privateWorkNotes,
        aiUseDisclosure: context.aiUseDisclosure,
      },
      interpretation: "Candidate context can explain ambiguity but remains separate from observed GitHub evidence.",
      limitations: "Candidate-provided context should be reviewed and corrected where needed.",
    });
  }

  return evidence;
}

function buildFunctionalReport(
  input: {
    reportId: string;
    organisationId: string;
    role: LocalRole;
    candidate: LocalCandidate;
    scan: LocalScan;
    repositories: RepositoryDiscovery[];
    contributions: ContributionRecord[];
    contextEntries: CandidateContextEntry[];
  },
  evidence: EvidenceItem[],
  createdAt: string,
): Report {
  const metadataIds = evidence.filter((item) => item.category === "repository_metadata").map((item) => item.id);
  const contributionIds = evidence.filter((item) => item.category === "candidate_contribution").map((item) => item.id);
  const practiceIds = evidence.filter((item) => ["testing", "ci_cd", "api_design", "data_modelling", "deployment", "documentation"].includes(item.category)).map((item) => item.id);
  const limitationIds = evidence.filter((item) => item.category === "ownership_limitations").map((item) => item.id);
  const contextIds = evidence.filter((item) => item.category === "candidate_context").map((item) => item.id);
  const briefClaims = buildExecutiveClaims(metadataIds, contributionIds, practiceIds, limitationIds, contextIds);
  const requirementMatrix = input.role.requirements.map((requirement, index) =>
    mapRequirementToEvidence(requirement, evidence, input.repositories, index),
  );
  const authorshipPlan = buildAuthorshipPlan(input.repositories, evidence, input.contributions);
  const interviewPlans = {
    "15": buildFunctionalInterviewQuestions("15", requirementMatrix, evidence).slice(0, 3),
    "30": buildFunctionalInterviewQuestions("30", requirementMatrix, evidence).slice(0, 5),
    "45": buildFunctionalInterviewQuestions("45", requirementMatrix, evidence).slice(0, 7),
    "60": buildFunctionalInterviewQuestions("60", requirementMatrix, evidence),
  };

  return {
    id: input.reportId,
    context: {
      candidateGithubHandle: input.candidate.githubHandle,
      selectedRepositories: input.repositories.map((repository) => repository.fullName),
      repositoryAccess: input.repositories.some((repository) => repository.visibility === "private") ? "mixed" : "public",
      jobRole: input.role.title,
      reportDate: createdAt,
      reportVersion: appConfig.product.reportVersion,
      evidenceVersion: appConfig.product.evidenceVersion,
      dataCutoff: input.scan.completedAt ?? createdAt,
      candidateReviewed: input.contextEntries.length > 0,
      humanReviewed: false,
    },
    warning: appConfig.product.reportWarning,
    publicEvidenceLabel: appConfig.product.publicEvidenceLabel,
    executiveBrief: briefClaims.map((item) => item.statement),
    projectMap: input.repositories.map((repository) => projectMapFromRepository(repository, evidence)),
    contributionEvidence: [
      claim(
        "claim_contribution_records",
        "contribution_and_ownership",
        contributionIds.length > 0
          ? "GitHub API-attributed contribution records were found for at least one selected repository."
          : "Visible contribution depth is not fully established from the current GitHub API sample.",
        contributionIds.length > 0 ? contributionIds : limitationIds,
        contributionIds.length > 0 ? "high" : "medium",
        "deterministic",
        "Repository ownership alone is not treated as proof of code authorship.",
      ),
    ],
    engineeringPracticeEvidence: [
      claim(
        "claim_practice_signals",
        "engineering_practice",
        practiceIds.length > 0
          ? "The selected repositories contain observable engineering-practice signals such as tests, CI, API, documentation, database or deployment files."
          : "Few engineering-practice files were observed in the selected repository sample.",
        practiceIds.length > 0 ? practiceIds.slice(0, 8) : metadataIds,
        practiceIds.length > 0 ? "high" : "medium",
        "deterministic",
        "Static file presence does not prove production reliability, coverage or complete design ownership.",
      ),
    ],
    requirementMatrix,
    authorshipVerificationPlan: authorshipPlan,
    interviewPlans,
    dataLimitations,
    candidateResponses: input.contextEntries.map((entry, index) => ({
      findingId: contextIds[index] ?? `context_${index}`,
      response:
        entry.featuresContributed || entry.historyNotes || "Candidate context was recorded for reviewer consideration.",
      status: "needs_review",
    })),
    claims: briefClaims,
  };
}

function buildExecutiveClaims(
  metadataIds: string[],
  contributionIds: string[],
  practiceIds: string[],
  limitationIds: string[],
  contextIds: string[],
) {
  const claims: ReportClaim[] = [
    claim(
      "claim_project_map",
      "executive_screening_brief",
      "A project and contribution map was generated from exact selected GitHub targets and file-tree signals.",
      metadataIds,
      "high",
      "deterministic",
      "This is limited to the repositories selected for this scan.",
    ),
  ];

  claims.push(
    claim(
      "claim_practice_evidence",
      "executive_screening_brief",
      practiceIds.length > 0
        ? "Observable engineering-practice signals were found and linked for interview preparation."
        : "Engineering-practice evidence is limited in the selected repository sample.",
      practiceIds.length > 0 ? practiceIds.slice(0, 6) : metadataIds,
      practiceIds.length > 0 ? "high" : "medium",
      "deterministic",
      "File presence is evidence for discussion, not a guarantee of quality or reliability.",
    ),
  );

  claims.push(
    claim(
      "claim_contribution_evidence",
      "executive_screening_brief",
      contributionIds.length > 0
        ? "GitHub API-attributed contribution records are available for targeted ownership questions."
        : "Contribution depth is ambiguous from the visible GitHub API sample.",
      contributionIds.length > 0 ? contributionIds.slice(0, 5) : limitationIds,
      contributionIds.length > 0 ? "high" : "medium",
      "deterministic",
      "Authorship depth should be tested through neutral interview questions and candidate context.",
    ),
  );

  if (contextIds.length > 0) {
    claims.push(
      claim(
        "claim_candidate_context",
        "executive_screening_brief",
        "Candidate-provided context is available and separated from observed GitHub evidence.",
        contextIds,
        "medium",
        "candidate",
        "Candidate context has not been independently verified by RepoProof.",
      ),
    );
  }

  return claims.slice(0, 5);
}

function projectMapFromRepository(repository: RepositoryDiscovery, evidence: EvidenceItem[]) {
  const ids = evidence
    .filter((item) => item.repositoryId === repository.id)
    .map((item) => item.id);
  return {
    repositoryId: repository.id,
    name: repository.fullName,
    description: repository.description || "No repository description provided.",
    repositoryAge: `${Math.max(0, new Date().getFullYear() - new Date(repository.createdAt).getFullYear())} years at the report date.`,
    latestRelevantActivity: repository.pushedAt.slice(0, 10),
    primaryLanguages: Object.keys(repository.languages),
    detectedFrameworks: repository.classification.detectedFrameworks,
    applicationType: repository.classification.applicationType,
    architectureSummary: architectureSummary(repository),
    testsObserved: repository.classification.tests.length > 0 ? `${repository.classification.tests.length} test path(s) observed.` : "No test files observed.",
    cicdObserved: repository.classification.workflows.length > 0 ? `${repository.classification.workflows.length} CI workflow path(s) observed.` : "No CI workflow observed.",
    deploymentObserved: repository.classification.deployment.length > 0 ? `${repository.classification.deployment.length} deployment configuration path(s) observed.` : "No deployment configuration observed.",
    documentationObserved: repository.classification.docs.length > 0 ? `${repository.classification.docs.length} documentation path(s) observed.` : "No documentation files observed.",
    databaseEvidence: repository.classification.migrations.length + repository.classification.schemas.length > 0 ? "Schema or migration paths observed." : "No database or migration evidence observed.",
    apiEvidence: repository.classification.apiRoutes.length > 0 ? `${repository.classification.apiRoutes.length} API route path(s) observed.` : "No API route evidence observed.",
    candidateContributionEvidence: "See contribution and ownership section for GitHub-attributed activity.",
    limitations: repository.limitations.join(" "),
    evidenceIds: ids.length > 0 ? ids : [evidenceId("metadata", repository.id)],
    secondaryMetadata: {
      stars: repository.stars,
      forks: repository.forks,
      note: "Popularity metrics are secondary metadata only.",
    },
  };
}

function mapRequirementToEvidence(
  requirement: LocalRole["requirements"][number],
  evidence: EvidenceItem[],
  repositories: RepositoryDiscovery[],
  index: number,
): RequirementEvidence {
  const haystack = evidence.map((item) => `${item.claim} ${item.interpretation} ${JSON.stringify(item.rawFact)}`.toLowerCase());
  const terms = requirement.name
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((term) => term.length > 2 && !["and", "the", "with", "for"].includes(term));
  const matchedIds = evidence
    .filter((_item, itemIndex) => terms.some((term) => haystack[itemIndex]?.includes(term)))
    .map((item) => item.id)
    .slice(0, 5);
  const sourceRepos = Array.from(
    new Set(evidence.filter((item) => matchedIds.includes(item.id)).map((item) => item.repositoryFullName)),
  );

  const status =
    matchedIds.length > 0
      ? "direct_evidence"
      : requirement.category === "collaboration" || requirement.category === "domain experience"
        ? "not_assessable"
        : "not_observed";

  const fallback = evidence.find((item) => item.category === "repository_metadata")?.id;
  return {
    requirement: requirement.name,
    importance: requirement.importance,
    status,
    evidenceIds: matchedIds.length > 0 ? matchedIds : fallback ? [fallback] : [evidence[index % evidence.length].id],
    confidence: matchedIds.length > 0 ? "high" : "medium",
    repositories: sourceRepos.length > 0 ? sourceRepos : repositories.map((repository) => repository.fullName),
    limitations:
      status === "not_observed" ? appConfig.product.notObservedWarning : "Evidence supports interview preparation, not an employment recommendation.",
    suggestedInterviewQuestion:
      status === "not_observed"
        ? `What ${requirement.name.toLowerCase()} work is relevant but not visible in these repositories?`
        : `Walk through the evidence that relates to ${requirement.name.toLowerCase()} and the decisions behind it.`,
  };
}

function buildAuthorshipPlan(
  repositories: RepositoryDiscovery[],
  evidence: EvidenceItem[],
  contributions: ContributionRecord[],
) {
  return repositories.slice(0, 5).map((repository) => {
    const repoEvidence = evidence.filter((item) => item.repositoryId === repository.id);
    const selected = repoEvidence.find((item) => item.category === "candidate_contribution") ?? repoEvidence[0];
    const contributionCount = contributions.filter((item) => item.repositoryFullName === repository.fullName).length;
    return {
      component: repository.fullName,
      whySelected:
        contributionCount > 0
          ? "GitHub API attribution found visible activity worth discussing."
          : "Visible ownership is limited or ambiguous, so neutral context questions are useful.",
      sourceUrl: selected.sourceUrl,
      evidenceIds: [selected.id],
      questions: [
        `Which part of ${repository.name} can you explain most deeply?`,
        "What design decision would you revisit if you worked on this again?",
      ],
      expectedConcepts: repository.classification.detectedFrameworks.length > 0
        ? repository.classification.detectedFrameworks
        : Object.keys(repository.languages).slice(0, 3),
      exercise:
        "Describe a small 10 to 15 minute change or debugging step using only authorised repository material.",
      alternativeVerbalExercise:
        "Explain how you would validate the change without executing untrusted repository code.",
      alternativeExplanations: [
        "History may have been squashed, imported, template-derived, private or attributed to a different verified account.",
      ],
      ownershipEvidenceConfidence: contributionCount > 0 ? ("high" as const) : ("low" as const),
    };
  });
}

function buildFunctionalInterviewQuestions(
  duration: "15" | "30" | "45" | "60",
  matrix: RequirementEvidence[],
  evidence: EvidenceItem[],
): InterviewQuestion[] {
  const questions = matrix.slice(0, 8).map((requirement, index) => ({
    id: `q_${duration}_${index + 1}`,
    type: questionTypeForRequirement(requirement.requirement),
    level: index > 4 ? ("advanced" as const) : index > 1 ? ("intermediate" as const) : ("introductory" as const),
    question: requirement.suggestedInterviewQuestion,
    purpose:
      requirement.status === "not_observed"
        ? "Explores an evidence gap without treating absence as a lack of skill."
        : "Tests understanding using exact linked evidence.",
    evidenceIds: requirement.evidenceIds,
    expectedThemes:
      requirement.status === "not_observed"
        ? ["relevant private or prior work", "limits of GitHub evidence", "specific examples", "scope boundaries"]
        : ["specific implementation details", "trade-offs", "testing approach", "limitations"],
    followUps: [
      "What would you change with more time?",
      "Which part was yours, and what context is missing from the repository?",
    ],
    limitations:
      requirement.status === "not_observed"
        ? appConfig.product.notObservedWarning
        : "The repository proves evidence exists, not complete authorship or production performance.",
  }));

  const liveEvidence = evidence.find((item) => item.observationType === "observed") ?? evidence[0];
  questions.push({
    id: `q_${duration}_live_change`,
    type: "debugging",
    level: "intermediate",
    question: "Describe one safe live-change or debugging exercise based on the selected repository evidence.",
    purpose: "Creates a practical exercise without executing untrusted code.",
    evidenceIds: [liveEvidence.id],
    expectedThemes: ["small scope", "static reasoning", "test plan", "rollback or verification"],
    followUps: ["What would make this unsafe to run during an interview?"],
    limitations: "The exercise should use only authorised repository material and can remain verbal.",
  });

  return questions;
}

function questionTypeForRequirement(requirement: string): InterviewQuestion["type"] {
  const lower = requirement.toLowerCase();
  if (lower.includes("test")) return "testing_strategy";
  if (lower.includes("api")) return "api_design";
  if (lower.includes("data") || lower.includes("postgres") || lower.includes("sql")) return "data_modelling";
  if (lower.includes("security") || lower.includes("payment")) return "security";
  if (lower.includes("cloud") || lower.includes("deploy")) return "deployment";
  if (lower.includes("team") || lower.includes("ownership")) return "code_ownership";
  return "architecture_explanation";
}

function addPresenceEvidence(
  evidence: EvidenceItem[],
  base: Omit<EvidenceItem, "id" | "category" | "claim" | "evidenceType" | "observationType" | "confidence" | "sourceUrl" | "sourceKind" | "rawFact" | "interpretation" | "limitations">,
  repository: RepositoryDiscovery,
  key: string,
  paths: string[],
  category: string,
  label: string,
) {
  evidence.push({
    ...base,
    id: evidenceId(key, repository.id),
    category,
    claim:
      paths.length > 0
        ? `${label} observed in ${repository.fullName}.`
        : `${label} was not observed in ${repository.fullName}.`,
    evidenceType: paths.length > 0 ? "file_presence" : "deterministic_metric",
    observationType: paths.length > 0 ? "observed" : "not_observed",
    confidence: paths.length > 0 ? "high" : "medium",
    sourceUrl: repository.canonicalUrl,
    sourceKind: "repository_tree",
    rawFact: { paths: paths.slice(0, 20), count: paths.length },
    interpretation:
      paths.length > 0
        ? `The repository contains ${label} signals that can be used in interview preparation.`
        : `${label} is absent from the sampled file tree.`,
    limitations: paths.length > 0
      ? "File presence does not prove quality, coverage or production reliability."
      : appConfig.product.notObservedWarning,
  });
}

function evidenceBase(
  input: { organisationId: string; candidate: LocalCandidate; scan: LocalScan },
  repository: RepositoryDiscovery,
  createdAt: string,
) {
  return {
    organisationId: input.organisationId,
    candidateId: input.candidate.id,
    scanId: input.scan.id,
    repositoryId: repository.id,
    repositoryFullName: repository.fullName,
    createdAt,
    extractorVersion: appConfig.product.extractorVersion,
  };
}

function architectureSummary(repository: RepositoryDiscovery) {
  const parts = [
    repository.classification.sourceFiles.length > 0 ? `${repository.classification.sourceFiles.length} source paths` : "",
    repository.classification.apiRoutes.length > 0 ? "API routes" : "",
    repository.classification.migrations.length + repository.classification.schemas.length > 0 ? "schema or migration files" : "",
    repository.classification.tests.length > 0 ? "tests" : "",
    repository.classification.workflows.length > 0 ? "CI workflows" : "",
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") + " are visible." : "Only limited structure was visible through the file tree.";
}

function evidenceId(...parts: Array<string | number | undefined>) {
  const raw = parts
    .filter((part): part is string | number => part !== undefined)
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 70);
  return `evi_${raw || crypto.randomUUID().slice(0, 8)}`;
}
