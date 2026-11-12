import Link from "next/link";
import { ArrowRight, Download, FileText, ShieldCheck, UserCheck } from "lucide-react";
import { demoEvidenceItems } from "@/src/fixtures/demo";
import { demoReport } from "@/src/lib/report-engine";
import type { EvidenceItem, Report } from "@/src/lib/evidence";
import { Button, EvidenceLink, GitHubLabel, Metric, Panel, Section, StatusBadge, WarningBanner } from "@/src/components/ui";
import type { LocalAdminReview, LocalReportRecord } from "@/src/lib/workspace-store";

export function ReportHeader({ report = demoReport }: { report?: Report }) {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_.9fr]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge label={report.publicEvidenceLabel} tone="gap" />
            <StatusBadge label={report.context.humanReviewed ? "Human quality review" : "Awaiting review"} tone="review" />
            <StatusBadge label={report.context.candidateReviewed ? "Candidate reviewed" : "Candidate not confirmed"} tone="candidate" />
          </div>
          <h1 className="max-w-4xl text-3xl font-semibold tracking-normal sm:text-5xl">
            Evidence brief for {report.context.candidateGithubHandle}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">{report.warning}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={`/reports/${report.id}/interview`} icon={<ArrowRight className="size-4" />}>
              Interview Plan
            </Button>
            <Button href={`/reports/${report.id}/export?format=pdf`} variant="secondary" icon={<Download className="size-4" />}>
              PDF
            </Button>
            <Button href={`/reports/${report.id}/review`} variant="secondary" icon={<UserCheck className="size-4" />}>
              Review
            </Button>
          </div>
        </div>
        <Panel>
          <h2 className="text-base font-semibold">Report Context</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            {[
              ["Job role", report.context.jobRole],
              ["Report version", report.context.reportVersion],
              ["Data cutoff", report.context.dataCutoff.slice(0, 10)],
              ["Report date", report.context.reportDate.slice(0, 10)],
              ["Reviewer", report.context.reviewer ?? "Not assigned"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-[var(--line)] pb-2 last:border-0">
                <dt className="text-[var(--muted)]">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </section>
  );
}

export function ExecutiveBrief({ report = demoReport, evidence = demoEvidenceItems }: { report?: Report; evidence?: EvidenceItem[] }) {
  return (
    <Section title="Executive Screening Brief" eyebrow="Maximum five bullets">
      <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
        <Panel>
          <ul className="space-y-3">
            {report.executiveBrief.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--brand-primary)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Repositories" value={String(report.context.selectedRepositories.length)} detail="Selected for this report" />
          <Metric label="Evidence items" value={String(evidence.length)} detail="Linked facts and limitations" />
          <Metric label="Requirements" value={String(report.requirementMatrix.length)} detail="Reviewed before analysis" />
          <Metric label="Interview plans" value="4" detail="15, 30, 45 and 60 minute guides" />
        </div>
      </div>
    </Section>
  );
}

export function ProjectMap({ report = demoReport }: { report?: Report }) {
  return (
    <Section title="Project Map" eyebrow="Repository evidence">
      <div className="grid gap-4 lg:grid-cols-3">
        {report.projectMap.map((project) => (
          <Panel key={project.repositoryId} className="flex flex-col gap-4">
            <div>
              <GitHubLabel value={project.name} />
              <p className="mt-3 text-sm text-[var(--muted)]">{project.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.detectedFrameworks.map((framework) => (
                <StatusBadge key={framework} label={framework} tone="observed" />
              ))}
            </div>
            <dl className="grid gap-2 text-sm">
              <Info label="Type" value={project.applicationType} />
              <Info label="Tests" value={project.testsObserved} />
              <Info label="CI/CD" value={project.cicdObserved} />
              <Info label="API" value={project.apiEvidence} />
              <Info label="Database" value={project.databaseEvidence} />
            </dl>
            <p className="mt-auto text-sm text-[var(--muted)]">{project.limitations}</p>
          </Panel>
        ))}
      </div>
    </Section>
  );
}

export function RequirementMatrix({ report = demoReport }: { report?: Report }) {
  return (
    <Section title="Job-Requirement Evidence Matrix" eyebrow="Role coverage">
      <WarningBanner>Not observed is not equivalent to lacking the skill.</WarningBanner>
      <div className="mt-4 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
        <div className="grid grid-cols-1 border-b border-[var(--line)] bg-background px-4 py-3 text-xs font-semibold uppercase tracking-normal text-[var(--muted)] md:grid-cols-[1fr_170px_120px_1.2fr]">
          <span>Requirement</span>
          <span>Status</span>
          <span>Confidence</span>
          <span>Question</span>
        </div>
        {report.requirementMatrix.map((requirement) => (
          <div key={requirement.requirement} className="grid gap-3 border-b border-[var(--line)] px-4 py-4 text-sm last:border-0 md:grid-cols-[1fr_170px_120px_1.2fr]">
            <div>
              <p className="font-medium">{requirement.requirement}</p>
              <p className="mt-1 text-[var(--muted)]">{requirement.limitations}</p>
            </div>
            <StatusBadge label={requirement.status.replaceAll("_", " ")} tone={statusTone(requirement.status)} />
            <span className="font-medium capitalize">{requirement.confidence}</span>
            <p>{requirement.suggestedInterviewQuestion}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function EvidenceList({
  ids,
  title = "Source Evidence",
  evidence: allEvidence = demoEvidenceItems,
}: {
  ids?: string[];
  title?: string;
  evidence?: EvidenceItem[];
}) {
  const evidenceById = new Map(allEvidence.map((item) => [item.id, item]));
  const evidence = ids?.length
    ? ids.map((id) => evidenceById.get(id)).filter((item): item is EvidenceItem => Boolean(item))
    : allEvidence;
  return (
    <Panel>
      <h3 className="mb-4 text-base font-semibold">{title}</h3>
      <div className="space-y-3">
        {evidence.map((item) => (
          <EvidenceLink key={item.id} evidence={item} />
        ))}
      </div>
    </Panel>
  );
}

export function ContributionAndPractice({ report = demoReport }: { report?: Report }) {
  return (
    <Section title="Contribution And Engineering Practice" eyebrow="Supported claims">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="text-base font-semibold">Contribution and ownership evidence</h3>
          <div className="mt-4 space-y-4">
            {report.contributionEvidence.map((claim) => (
              <ClaimBlock key={claim.id} claim={claim.statement} evidenceIds={claim.evidenceIds} limitations={claim.limitations} />
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="text-base font-semibold">Engineering-practice evidence</h3>
          <div className="mt-4 space-y-4">
            {report.engineeringPracticeEvidence.map((claim) => (
              <ClaimBlock key={claim.id} claim={claim.statement} evidenceIds={claim.evidenceIds} limitations={claim.limitations} />
            ))}
          </div>
        </Panel>
      </div>
    </Section>
  );
}

export function AuthorshipPlan({ report = demoReport }: { report?: Report }) {
  return (
    <Section title="Authorship-Verification Plan" eyebrow="Neutral interview prompts">
      <div className="grid gap-4 lg:grid-cols-3">
        {report.authorshipVerificationPlan.map((probe) => (
          <Panel key={probe.component}>
            <StatusBadge label={`${probe.ownershipEvidenceConfidence} confidence`} tone={probe.ownershipEvidenceConfidence === "low" ? "ambiguous" : "observed"} />
            <h3 className="mt-3 text-lg font-semibold">{probe.component}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{probe.whySelected}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {probe.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-medium">Exercise</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{probe.exercise}</p>
          </Panel>
        ))}
      </div>
    </Section>
  );
}

export function InterviewPlan({
  duration = "30",
  report = demoReport,
  evidence = demoEvidenceItems,
}: {
  duration?: "15" | "30" | "45" | "60";
  report?: Report;
  evidence?: EvidenceItem[];
}) {
  const questions = report.interviewPlans[duration];
  return (
    <Section
      title={`${duration}-Minute Interview Plan`}
      eyebrow="Evidence-linked guide"
      actions={
        <>
          {(["15", "30", "45", "60"] as const).map((value) => (
            <Button key={value} href={`/reports/${report.id}/interview?duration=${value}`} variant={value === duration ? "primary" : "secondary"}>
              {value}
            </Button>
          ))}
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Panel key={question.id}>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={`${index + 1}`} tone="neutral" />
                <StatusBadge label={question.type.replaceAll("_", " ")} tone="observed" />
                <StatusBadge label={question.level} tone="candidate" />
              </div>
              <h3 className="mt-3 text-lg font-semibold">{question.question}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{question.purpose}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MiniList title="Expected themes" items={question.expectedThemes} />
                <MiniList title="Follow-ups" items={question.followUps} />
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">{question.limitations}</p>
            </Panel>
          ))}
        </div>
        <EvidenceList ids={Array.from(new Set(questions.flatMap((question) => question.evidenceIds)))} evidence={evidence} />
      </div>
    </Section>
  );
}

export function DataLimitations({ report = demoReport }: { report?: Report }) {
  return (
    <Section title="Data Limitations" eyebrow="Always visible">
      <Panel>
        <ul className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
          {report.dataLimitations.map((limitation) => (
            <li key={limitation} className="flex gap-3">
              <FileText className="mt-0.5 size-4 shrink-0 text-[var(--brand-accent)]" />
              <span>{limitation}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </Section>
  );
}

export function CandidateResponsePanel({ report = demoReport }: { report?: Report }) {
  return (
    <Section title="Candidate Response" eyebrow="Correction workflow">
      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <Panel>
          <h3 className="text-base font-semibold">Available actions</h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>Correct repository selection.</li>
            <li>Explain contribution context.</li>
            <li>Provide links to relevant pull requests or commits.</li>
            <li>Challenge a factual finding.</li>
            <li>Explain template use or missing history.</li>
            <li>Request deletion or approve sharing.</li>
          </ul>
        </Panel>
        <Panel>
          <h3 className="text-base font-semibold">Responses on this report</h3>
          <div className="mt-4 space-y-3">
            {report.candidateResponses.map((response) => (
              <div key={response.findingId} className="rounded-lg border border-[var(--line)] bg-background p-4 text-sm">
                <StatusBadge label={response.status.replaceAll("_", " ")} tone="candidate" />
                <p className="mt-3">{response.response}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Section>
  );
}

export function FullReport({ report = demoReport, evidence = demoEvidenceItems }: { report?: Report; evidence?: EvidenceItem[] }) {
  return (
    <>
      <ReportHeader report={report} />
      <ExecutiveBrief report={report} evidence={evidence} />
      <ProjectMap report={report} />
      <ContributionAndPractice report={report} />
      <RequirementMatrix report={report} />
      <AuthorshipPlan report={report} />
      <InterviewPlan duration="30" report={report} evidence={evidence} />
      <DataLimitations report={report} />
      <CandidateResponsePanel report={report} />
    </>
  );
}

export function AdminQueue({
  reviews,
  reports,
}: {
  reviews?: LocalAdminReview[];
  reports?: LocalReportRecord[];
}) {
  const queue =
    reviews && reports
      ? reviews.map((review) => {
          const report = reports.find((item) => item.id === review.reportId);
          return {
            id: review.reportId,
            status: review.status,
            detail:
              review.status === "awaiting_review"
                ? `${review.lowConfidenceClaimsReviewed} low or medium-confidence item(s) first`
                : review.reviewerNotes || "Review action recorded",
            reviewer: review.reviewer ?? "Unassigned",
            candidate: report?.report.context.candidateGithubHandle ?? "Unknown",
          };
        })
      : [];
  return (
    <Section title="Admin Review Queue" eyebrow="Concierge mode">
      <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
        {queue.length > 0 ? (
          queue.map(({ id, status, detail, reviewer, candidate }) => (
            <Link
              key={id}
              href={`/admin/review/${id}`}
              className="grid gap-3 border-b border-[var(--line)] px-4 py-4 text-sm no-underline last:border-0 md:grid-cols-[1fr_180px_1.2fr_160px]"
            >
              <span>
                <span className="block font-medium">{candidate}</span>
                <span className="text-xs text-[var(--muted)]">{id}</span>
              </span>
              <StatusBadge label={status} tone={status === "delivered" || status === "approved" ? "observed" : "review"} />
              <span className="text-[var(--muted)]">{detail}</span>
              <span>{reviewer}</span>
            </Link>
          ))
        ) : (
          <div className="px-4 py-8 text-sm text-[var(--muted)]">No reports are waiting for review.</div>
        )}
      </div>
    </Section>
  );
}

function ClaimBlock({
  claim,
  evidenceIds,
  limitations,
}: {
  claim: string;
  evidenceIds: string[];
  limitations: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-background p-4">
      <p className="text-sm font-medium">{claim}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{limitations}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {evidenceIds.map((id) => (
          <StatusBadge key={id} label={id} tone="neutral" />
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd className="mt-1 text-[var(--muted)]">{value}</dd>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-background p-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-[var(--muted)]">{title}</p>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "direct_evidence" || status === "adjacent_evidence") return "observed";
  if (status === "candidate_claim_only") return "candidate";
  if (status === "ambiguous") return "ambiguous";
  return "gap";
}
