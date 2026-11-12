import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Database,
  FileSearch,
  GitBranch,
  LockKeyhole,
  Plus,
  RotateCcw,
  Settings,
  UserPlus,
} from "lucide-react";
import { appConfig, formatPrice, pricePlans } from "@/src/lib/config";
import {
  createCandidateAction,
  createRoleAction,
  createScanAction,
  resetWorkspaceAction,
  reviewReportAction,
  saveCandidateContextAction,
} from "@/src/lib/actions";
import {
  AdminQueue,
  EvidenceList,
  FullReport,
  InterviewPlan,
} from "@/src/components/report-components";
import {
  Button,
  EmptyState,
  GitHubLabel,
  Metric,
  PageFrame,
  Panel,
  Section,
  StatusBadge,
  TrustStrip,
  WarningBanner,
} from "@/src/components/ui";
import type {
  LocalCandidate,
  LocalReportRecord,
  LocalRole,
  LocalScan,
  WorkspaceState,
} from "@/src/lib/workspace-store";

const fieldClass = "mt-1 min-h-11 w-full rounded-md border border-[var(--line)] bg-background px-3 text-sm outline-none focus:border-[var(--brand-primary)]";
const textAreaClass = "mt-1 min-h-32 w-full rounded-md border border-[var(--line)] bg-background p-3 text-sm outline-none focus:border-[var(--brand-primary)]";

export function LandingPage() {
  return (
    <PageFrame>
      <section className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <StatusBadge label="Working recruiting operations app" tone="observed" />
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal sm:text-6xl">
              {appConfig.brand.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{appConfig.brand.copy}</p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">{appConfig.brand.alternativeCopy}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/dashboard" icon={<ArrowRight className="size-4" />}>
                Open Workspace
              </Button>
              <Button href="/candidates/new" variant="secondary" icon={<UserPlus className="size-4" />}>
                New Candidate
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-background p-4 shadow-sm">
            <div className="grid gap-3">
              {[
                ["1", "Create role", "Paste a job description and review extracted requirements."],
                ["2", "Add candidate", "Enter an exact GitHub profile or repository URL."],
                ["3", "Select repositories", "Choose up to five repositories with transparent selection."],
                ["4", "Generate report", "Run analysis, review evidence and prepare interview questions."],
              ].map(([number, title, detail]) => (
                <div key={title} className="grid grid-cols-[40px_1fr] gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
                  <span className="grid size-9 place-items-center rounded-md bg-[var(--brand-primary)] text-sm font-semibold text-white">{number}</span>
                  <span>
                    <span className="block font-medium">{title}</span>
                    <span className="text-sm text-[var(--muted)]">{detail}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
              {appConfig.product.reportWarning}
            </div>
          </div>
        </div>
      </section>
      <Section title="Operational Guardrails" eyebrow="Always on">
        <TrustStrip />
      </Section>
    </PageFrame>
  );
}

export function PricingPage() {
  return (
    <PageFrame>
      <Section title="Pricing" eyebrow="Configurable launch offers">
        <div className="grid gap-4 lg:grid-cols-3">
          {pricePlans.map((plan) => (
            <Panel key={plan.key} className="flex flex-col">
              <h2 className="text-lg font-semibold">{plan.label}</h2>
              <p className="mt-3 text-3xl font-semibold">{formatPrice(plan)}</p>
              <p className="mt-3 min-h-16 text-sm leading-6 text-[var(--muted)]">{plan.notes}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Credits" value={String(plan.reportCredits)} />
                <Row label="Human review" value={plan.humanReviewed ? "Included" : "Optional"} />
              </dl>
              <Button href={`/api/checkout?plan=${plan.key}`} variant={plan.key === "foundingPilot" ? "primary" : "secondary"}>
                Checkout
              </Button>
            </Panel>
          ))}
        </div>
      </Section>
    </PageFrame>
  );
}

export function AudiencePage({ audience }: { audience: "recruiters" | "founders" | "candidates" }) {
  const copy = {
    recruiters: ["Recruiter workflow", "Create evidence-backed dossiers without relying on repository names or stars."],
    founders: ["Founder workflow", "Prepare focused first engineering interviews without pretending GitHub is the whole picture."],
    candidates: ["Candidate workflow", "See what is collected, add context, correct findings, request deletion and approve sharing."],
  }[audience];
  return (
    <PageFrame>
      <Section title={copy[0]} eyebrow={audience}>
        <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
          <Panel>
            <h1 className="text-2xl font-semibold">{copy[0]}</h1>
            <p className="mt-3 text-[var(--muted)]">{copy[1]}</p>
            <div className="mt-5">
              <Button href="/dashboard" icon={<ArrowRight className="size-4" />}>Open Workspace</Button>
            </div>
          </Panel>
          <Panel>
            <ul className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                "Exact GitHub target validation",
                "Repository selection capped for focus",
                "Candidate correction workflow",
                "Evidence-linked interview plan",
                "Admin quality review queue",
                "Visible data limitations",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--brand-primary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Section>
    </PageFrame>
  );
}

export function StaticPolicyPage({ title }: { title: string }) {
  return (
    <PageFrame>
      <Section title={title} eyebrow="Operator policy">
        <div className="grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
          <Panel>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              These MVP terms are implementation placeholders for operator review before commercial use.
            </p>
          </Panel>
          <Panel>
            <ul className="space-y-3 text-sm leading-6 text-[var(--muted)]">
              <li>RepoProof collects minimum data needed to produce a limited technical evidence brief.</li>
              <li>Private repositories require explicit candidate authorisation through a read-only GitHub App.</li>
              <li>Reports retain uncertainty labels and must not be the sole basis for an employment decision.</li>
              <li>Deletion, correction and export requests are represented in the product data model.</li>
              <li>Repository contents are untrusted data and are never executed by the analysis pipeline.</li>
            </ul>
          </Panel>
        </div>
      </Section>
    </PageFrame>
  );
}

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  return (
    <PageFrame>
      <Section title={mode === "login" ? "Login" : "Create Account"} eyebrow="Local auth adapter">
        <Panel className="max-w-xl">
          <form className="space-y-4">
            <label className="block text-sm font-medium">
              Email
              <input className={fieldClass} defaultValue="recruiter@example.com" />
            </label>
            <label className="block text-sm font-medium">
              Organisation
              <input className={fieldClass} defaultValue="Northstar Talent" />
            </label>
            <Button href="/dashboard" icon={<ArrowRight className="size-4" />}>
              Continue
            </Button>
          </form>
        </Panel>
      </Section>
    </PageFrame>
  );
}

export function DashboardPage({ workspace }: { workspace: WorkspaceState }) {
  const latestReport = workspace.reports[0];
  return (
    <PageFrame>
      <Section
        title="Dashboard"
        eyebrow={workspace.organisation.name}
        actions={
          <>
            <Button href="/jobs/new" variant="secondary" icon={<Plus className="size-4" />}>Role</Button>
            <Button href="/candidates/new" icon={<UserPlus className="size-4" />}>Candidate</Button>
          </>
        }
      >
        <WorkspaceSummary workspace={workspace} />
        <div className="mt-4">
          <TrustStrip />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Panel>
            <h2 className="text-lg font-semibold">Next action</h2>
            {workspace.candidates.length === 0 ? (
              <EmptyState title="Add the first candidate" detail="Enter an exact GitHub profile or repository URL, then select repositories for analysis." action={<Button href="/candidates/new">Add Candidate</Button>} />
            ) : latestReport ? (
              <div className="mt-4">
                <StatusBadge label={latestReport.status} tone={latestReport.status === "approved" || latestReport.status === "delivered" ? "observed" : "review"} />
                <h3 className="mt-3 text-xl font-semibold">{latestReport.report.context.candidateGithubHandle}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{latestReport.report.executiveBrief[0]}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button href={`/reports/${latestReport.id}`}>Open Report</Button>
                  <Button href={`/admin/review/${latestReport.id}`} variant="secondary">Review</Button>
                </div>
              </div>
            ) : (
              <EmptyState title="Run a scan" detail="Select repositories on a candidate profile and generate a report." action={<Button href={`/candidates/${workspace.candidates[0].id}`}>Select Repositories</Button>} />
            )}
          </Panel>
          <Panel>
            <h2 className="text-lg font-semibold">Review queue</h2>
            <div className="mt-4 space-y-3">
              {workspace.adminReviews.length > 0 ? (
                workspace.adminReviews.slice(0, 4).map((review) => (
                  <Link key={review.id} href={`/admin/review/${review.reportId}`} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-background p-3 text-sm no-underline">
                    <span>
                      <span className="block font-medium">{review.reportId}</span>
                      <span className="text-[var(--muted)]">{review.lowConfidenceClaimsReviewed} item(s) to inspect</span>
                    </span>
                    <StatusBadge label={review.status} tone={review.status === "approved" ? "observed" : "review"} />
                  </Link>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-[var(--line)] px-4 py-6 text-sm text-[var(--muted)]">
                  Reports appear here after analysis, before they are approved or delivered.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </Section>
    </PageFrame>
  );
}

export function JobsPage({
  workspace,
  role,
  newJob = false,
}: {
  workspace: WorkspaceState;
  role?: LocalRole;
  newJob?: boolean;
}) {
  const selected = role ?? workspace.roles[0];
  return (
    <PageFrame>
      <Section
        title={newJob ? "New Role" : selected ? selected.title : "Roles"}
        eyebrow="Requirement editor"
        actions={<Button href="/jobs/new" icon={<Plus className="size-4" />}>New Role</Button>}
      >
        {newJob ? <RoleForm /> : selected ? <RoleDetail workspace={workspace} role={selected} /> : <EmptyState title="No roles yet" detail="Create a role before adding candidates or running scans." action={<Button href="/jobs/new">Create Role</Button>} />}
      </Section>
    </PageFrame>
  );
}

export function CandidatesPage({
  workspace,
  candidate,
  context = false,
  newCandidate = false,
}: {
  workspace: WorkspaceState;
  candidate?: LocalCandidate;
  context?: boolean;
  newCandidate?: boolean;
}) {
  const selected = candidate ?? workspace.candidates[0];
  return (
    <PageFrame>
      <Section
        title={newCandidate ? "New Candidate" : context ? "Candidate Context" : selected ? selected.neutralIdentifier : "Candidates"}
        eyebrow="Candidate review"
        actions={<Button href="/candidates/new" icon={<UserPlus className="size-4" />}>New Candidate</Button>}
      >
        {newCandidate ? (
          <CandidateForm workspace={workspace} />
        ) : selected ? (
          context ? <CandidateContextForm candidate={selected} /> : <CandidateDetail workspace={workspace} candidate={selected} />
        ) : (
          <EmptyState title="No candidates yet" detail="Add a candidate using an exact GitHub URL or username." action={<Button href="/candidates/new">Add Candidate</Button>} />
        )}
      </Section>
    </PageFrame>
  );
}

export function ScanPage({ workspace, scan }: { workspace: WorkspaceState; scan?: LocalScan }) {
  const selected = scan ?? workspace.scans[0];
  const report = workspace.reports.find((item) => item.scanId === selected?.id);
  return (
    <PageFrame>
      <Section title={selected ? `Scan ${selected.id}` : "Scans"} eyebrow="Asynchronous analysis">
        {selected ? (
          <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
            <Panel>
              <StatusBadge label={selected.status} tone={selected.status === "failed" ? "ambiguous" : selected.status === "awaiting_review" || selected.status === "approved" ? "review" : "observed"} />
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="GitHub target" value={selected.canonicalGithubUrl} />
                <Row label="Started" value={formatDate(selected.startedAt)} />
                <Row label="Completed" value={selected.completedAt ? formatDate(selected.completedAt) : "Running"} />
                <Row label="Repositories" value={String(selected.selectedRepositoryIds.length)} />
              </dl>
              {report ? <div className="mt-5"><Button href={`/reports/${report.id}`}>Open Report</Button></div> : null}
            </Panel>
            {report ? <EvidenceList evidence={report.evidence} title="Extracted Evidence" /> : <EmptyState title="No report yet" detail="The scan has not produced a report." />}
          </div>
        ) : (
          <EmptyState title="No scans yet" detail="Create a candidate and run analysis from their profile." />
        )}
      </Section>
    </PageFrame>
  );
}

export function ReportPage({ record }: { record?: LocalReportRecord }) {
  return (
    <PageFrame>
      {record ? <FullReport report={record.report} evidence={record.evidence} /> : <Section title="Report not found"><EmptyState title="No report found" detail="Run a scan to create a report." /></Section>}
    </PageFrame>
  );
}

export function InterviewPage({
  record,
  duration = "30",
}: {
  record?: LocalReportRecord;
  duration?: "15" | "30" | "45" | "60";
}) {
  return (
    <PageFrame>
      {record ? <InterviewPlan duration={duration} report={record.report} evidence={record.evidence} /> : <Section title="Interview Plan"><EmptyState title="No report found" detail="Generate a report first." /></Section>}
    </PageFrame>
  );
}

export function ReviewPage({
  workspace,
  record,
  admin = false,
}: {
  workspace: WorkspaceState;
  record?: LocalReportRecord;
  admin?: boolean;
}) {
  const review = workspace.adminReviews.find((item) => item.reportId === record?.id);
  return (
    <PageFrame>
      <Section title={admin ? "Admin Report Review" : "Report Review"} eyebrow="Quality review">
        {record ? (
          <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
            <Panel>
              <StatusBadge label={record.status} tone={record.status === "approved" || record.status === "delivered" ? "observed" : "review"} />
              <h1 className="mt-3 text-xl font-semibold">{record.report.context.candidateGithubHandle}</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">Reviewer checks report quality and evidence linkage only. RepoProof never claims a human verified code authorship.</p>
              <form action={reviewReportAction} className="mt-5 space-y-3">
                <input type="hidden" name="reportId" value={record.id} />
                <label className="block text-sm font-medium">
                  Reviewer notes
                  <textarea name="reviewerNotes" className={textAreaClass} defaultValue={review?.reviewerNotes} />
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ReviewButton value="approve" label="Approve" />
                  <ReviewButton value="request_context" label="Request context" />
                  <ReviewButton value="revision" label="Revision required" />
                  <ReviewButton value="deliver" label="Mark delivered" />
                </div>
              </form>
            </Panel>
            <EvidenceList evidence={record.evidence} ids={record.evidence.filter((item) => item.confidence !== "high").map((item) => item.id)} title="Low-confidence or Ambiguous Evidence" />
          </div>
        ) : (
          <EmptyState title="Report not found" detail="The review queue item no longer exists." />
        )}
      </Section>
    </PageFrame>
  );
}

export function ExportPage({ record }: { record?: LocalReportRecord }) {
  return (
    <PageFrame>
      <Section title="Exports" eyebrow="Report files">
        {record ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Print report", `/reports/${record.id}/export?format=html`],
              ["PDF report", `/reports/${record.id}/export?format=pdf`],
              ["Evidence CSV", `/reports/${record.id}/export?format=evidence_csv`],
              ["Requirements CSV", `/reports/${record.id}/export?format=requirements_csv`],
            ].map(([label, href]) => (
              <Panel key={label}>
                <FileSearch className="size-6 text-[var(--brand-primary)]" />
                <h2 className="mt-3 text-base font-semibold">{label}</h2>
                <Button href={href} variant="secondary">Open</Button>
              </Panel>
            ))}
          </div>
        ) : (
          <EmptyState title="No report found" detail="Run a scan to create exportable files." />
        )}
      </Section>
    </PageFrame>
  );
}

export function InvitePage({
  workspace,
  token,
  expired,
}: {
  workspace: WorkspaceState;
  token: string;
  expired?: boolean;
}) {
  const invite = workspace.candidateInvitations.find((item) => item.token === token);
  const candidate = workspace.candidates.find((item) => item.id === invite?.candidateId);
  const isExpired = expired ?? !invite;
  return (
    <PageFrame>
      <Section title={isExpired ? "Invitation Expired" : "Candidate Invitation"} eyebrow="Signed link">
        <Panel className="max-w-3xl">
          {isExpired || !candidate ? (
            <EmptyState title="This invitation is no longer active" detail="A recruiter can issue a fresh signed invitation from the candidate record." />
          ) : (
            <>
              <h1 className="text-xl font-semibold">{workspace.organisation.name} requested a GitHub evidence report</h1>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                <li>Repository metadata, selected file paths, short excerpts, commits and pull requests may be collected.</li>
                <li>The report will show evidence links, limitations, interview questions and your responses.</li>
                <li>Default report retention is {workspace.organisation.retentionDays} days and deletion can be requested.</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button href={`/candidates/${candidate.id}/context`}>Add Context</Button>
                <Button href="/share/local-share" variant="secondary">Preview Shared Report</Button>
              </div>
            </>
          )}
        </Panel>
      </Section>
    </PageFrame>
  );
}

export function SettingsPage({ workspace, section = "settings" }: { workspace: WorkspaceState; section?: string }) {
  const items = [
    ["Team", "Manage reviewers and recruiters", Settings],
    ["GitHub", "Read-only GitHub App setup", GitBranch],
    ["Billing", "Plans, credits and invoices", CreditCard],
    ["Data retention", "Raw content deletion and report retention", Database],
    ["Audit log", "Reviewer and webhook actions", FileSearch],
  ] as const;
  return (
    <PageFrame>
      <Section title={section === "settings" ? "Settings" : titleize(section)} eyebrow={workspace.organisation.name}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(([label, detail, Icon]) => (
            <Panel key={String(label)}>
              <Icon className="size-6 text-[var(--brand-primary)]" />
              <h2 className="mt-3 text-base font-semibold">{label}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{detail}</p>
            </Panel>
          ))}
        </div>
        <Panel className="mt-5">
          <h2 className="text-base font-semibold">Local workspace controls</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">State is persisted in `.repoproof-data/workspace.json` for local development.</p>
          <form action={resetWorkspaceAction} className="mt-4">
            <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-medium">
              <RotateCcw className="size-4" />
              Reset local workspace
            </button>
          </form>
        </Panel>
      </Section>
    </PageFrame>
  );
}

export function AdminPage({ workspace, section = "overview" }: { workspace: WorkspaceState; section?: string }) {
  return (
    <PageFrame>
      <Section title={section === "overview" ? "Admin" : titleize(section)} eyebrow="Operations">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Queued" value={String(workspace.reports.filter((report) => report.status === "awaiting_review").length)} detail="Awaiting quality review" />
          <Metric label="Context" value={String(workspace.candidates.filter((candidate) => candidate.contextEntries.length > 0).length)} detail="Candidates with context" />
          <Metric label="Approved" value={String(workspace.reports.filter((report) => report.status === "approved").length)} detail="Ready for delivery" />
          <Metric label="Audit logs" value={String(workspace.auditLogs.length)} detail="Recorded actions" />
        </div>
      </Section>
      <AdminQueue reviews={workspace.adminReviews} reports={workspace.reports} />
    </PageFrame>
  );
}

export function AuthCallbackPage() {
  return (
    <PageFrame>
      <Section title="Authentication Callback" eyebrow="Local auth adapter">
        <Panel className="max-w-2xl">
          <LockKeyhole className="size-7 text-[var(--brand-primary)]" />
          <p className="mt-3 text-sm text-[var(--muted)]">Local auth creates a deterministic recruiter session for this workspace.</p>
          <div className="mt-5">
            <Button href="/dashboard">Continue</Button>
          </div>
        </Panel>
      </Section>
    </PageFrame>
  );
}

function WorkspaceSummary({ workspace }: { workspace: WorkspaceState }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Report credits" value={String(workspace.organisation.reportCredits)} detail="Local entitlement balance" />
      <Metric label="Roles" value={String(workspace.roles.length)} detail="Reviewed requirement sets" />
      <Metric label="Candidates" value={String(workspace.candidates.length)} detail="GitHub targets added" />
      <Metric label="Reports" value={String(workspace.reports.length)} detail="Generated versions" />
    </div>
  );
}

function RoleForm() {
  return (
    <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
      <Panel>
        <form action={createRoleAction} className="space-y-4">
          <label className="block text-sm font-medium">
            Role title
            <input name="title" required className={fieldClass} placeholder="Senior full-stack engineer" />
          </label>
          <label className="block text-sm font-medium">
            Job description
            <textarea name="jobDescription" required className={textAreaClass} placeholder="Paste the role requirements recruiters will review before analysis." />
          </label>
          <Button type="submit" icon={<ArrowRight className="size-4" />}>Create Role</Button>
        </form>
      </Panel>
      <Panel>
        <h2 className="text-base font-semibold">What happens next</h2>
        <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
          <li>Requirements are extracted into editable structured rows.</li>
          <li>Each requirement is later labelled direct evidence, adjacent evidence, candidate claim, ambiguous, not observed or not assessable.</li>
          <li>No overall fit percentage or employment recommendation is produced.</li>
        </ul>
      </Panel>
    </div>
  );
}

function RoleDetail({ workspace, role }: { workspace: WorkspaceState; role: LocalRole }) {
  const linkedCandidates = workspace.candidates.filter((candidate) => candidate.roleId === role.id);
  return (
    <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
      <Panel>
        <StatusBadge label={role.status} tone="observed" />
        <h1 className="mt-3 text-xl font-semibold">{role.title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{role.jobDescription}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button href="/candidates/new" icon={<UserPlus className="size-4" />}>Add Candidate</Button>
        </div>
      </Panel>
      <Panel>
        <h2 className="text-base font-semibold">Reviewed requirements</h2>
        <div className="mt-4 space-y-3">
          {role.requirements.map((requirement) => (
            <div key={requirement.id} className="rounded-lg border border-[var(--line)] bg-background p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{requirement.name}</span>
                <StatusBadge label={requirement.importance} tone={requirement.importance === "high" ? "review" : "neutral"} />
              </div>
              <p className="mt-2 text-[var(--muted)]">{requirement.minimumEvidenceExpected}</p>
            </div>
          ))}
        </div>
        {linkedCandidates.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold">Candidates for this role</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {linkedCandidates.map((candidate) => (
                <Button key={candidate.id} href={`/candidates/${candidate.id}`} variant="secondary">{candidate.neutralIdentifier}</Button>
              ))}
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}

function CandidateForm({ workspace }: { workspace: WorkspaceState }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
      <Panel>
        <form action={createCandidateAction} className="space-y-4">
          <label className="block text-sm font-medium">
            Role
            <select name="roleId" required className={fieldClass}>
              {workspace.roles.map((role) => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Neutral candidate identifier
            <input name="neutralIdentifier" required className={fieldClass} placeholder="Candidate 042" />
          </label>
          <label className="block text-sm font-medium">
            Exact GitHub profile or repository URL
            <input name="githubTarget" required className={fieldClass} placeholder="https://github.com/org/repo or octocat" />
          </label>
          <WarningBanner>Use this only for a legitimate recruiting process. Absence of public evidence is not proof the candidate lacks a skill.</WarningBanner>
          <Button type="submit" icon={<ArrowRight className="size-4" />}>Discover Repositories</Button>
        </form>
      </Panel>
      <Panel>
        <h2 className="text-base font-semibold">Public GitHub mode</h2>
        <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
          <li>Uses the official GitHub API and rejects lookalike domains.</li>
          <li>Does not search by real-world name or infer identity.</li>
          <li>Repository files are classified statically and never executed.</li>
          <li>Private repositories require the read-only GitHub App setup.</li>
        </ul>
      </Panel>
    </div>
  );
}

function CandidateDetail({ workspace, candidate }: { workspace: WorkspaceState; candidate: LocalCandidate }) {
  const role = workspace.roles.find((item) => item.id === candidate.roleId);
  const reports = workspace.reports.filter((report) => report.candidateId === candidate.id);
  return (
    <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
      <Panel>
        <StatusBadge label={candidate.blindReview ? "blind review enabled" : "blind review off"} tone="observed" />
        <h1 className="mt-3 text-xl font-semibold">{candidate.neutralIdentifier}</h1>
        <div className="mt-4 space-y-3">
          <GitHubLabel value={candidate.githubHandle} />
          <p className="text-sm text-[var(--muted)]">{candidate.canonicalGithubUrl}</p>
          <Row label="Role" value={role?.title ?? "No role"} />
          <Row label="Discovered repositories" value={String(candidate.repositories.length)} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button href={`/candidates/${candidate.id}/context`} variant="secondary">Add Context</Button>
          {reports[0] ? <Button href={`/reports/${reports[0].id}`}>Latest Report</Button> : null}
        </div>
      </Panel>
      <Panel>
        <h2 className="text-base font-semibold">Select repositories and run analysis</h2>
        {candidate.repositories.length > 0 ? (
          <form action={createScanAction} className="mt-4 space-y-3">
            <input type="hidden" name="candidateId" value={candidate.id} />
            <input type="hidden" name="roleId" value={candidate.roleId} />
            {candidate.repositories.map((repository) => (
              <label key={repository.id} className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-background p-3 text-sm">
                <input
                  type="checkbox"
                  name="repositoryIds"
                  value={repository.id}
                  defaultChecked={candidate.selectedRepositoryIds.includes(repository.id)}
                  className="mt-1"
                />
                <span className="min-w-0">
                  <span className="block font-medium">{repository.fullName}</span>
                  <span className="block text-[var(--muted)]">{repository.description || repository.classification.applicationType}</span>
                  <span className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge label={repository.fork ? "fork" : "source"} tone={repository.fork ? "ambiguous" : "observed"} />
                    <StatusBadge label={repository.archived ? "archived" : "active"} tone={repository.archived ? "gap" : "observed"} />
                    <StatusBadge label={repository.classification.applicationType} tone="neutral" />
                  </span>
                </span>
              </label>
            ))}
            <Button type="submit" icon={<ArrowRight className="size-4" />}>Run Analysis</Button>
          </form>
        ) : (
          <EmptyState title="No repositories discovered" detail="Check the GitHub target or configure a GitHub token if rate limits are reached." />
        )}
      </Panel>
    </div>
  );
}

function CandidateContextForm({ candidate }: { candidate: LocalCandidate }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
      <Panel>
        <h1 className="text-xl font-semibold">{candidate.neutralIdentifier}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Candidate context is stored separately from observed GitHub evidence and shown with candidate-claim labels.</p>
      </Panel>
      <Panel>
        <form action={saveCandidateContextAction} className="grid gap-3">
          <input type="hidden" name="candidateId" value={candidate.id} />
          <label className="text-sm font-medium">
            Repository
            <select name="repositoryFullName" className={fieldClass}>
              <option value="">All selected repositories</option>
              {candidate.repositories.map((repository) => (
                <option key={repository.id} value={repository.fullName}>{repository.fullName}</option>
              ))}
            </select>
          </label>
          {[
            ["roleDescription", "Role"],
            ["soloOrTeam", "Solo or team work"],
            ["timePeriod", "Time period"],
            ["featuresContributed", "Features contributed"],
            ["historyNotes", "Squashed, imported or missing history"],
            ["templateNotes", "Template use"],
            ["privateWorkNotes", "Relevant private work"],
            ["aiUseDisclosure", "AI tool use disclosure"],
          ].map(([name, label]) => (
            <label key={name} className="text-sm font-medium">
              {label}
              <textarea name={name} className={textAreaClass} />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="shareApproved" />
            Approve sharing identifiable context with the recruiter
          </label>
          <Button type="submit">Record Context</Button>
        </form>
      </Panel>
    </div>
  );
}

function ReviewButton({ value, label }: { value: string; label: string }) {
  return (
    <button
      name="reviewAction"
      value={value}
      className="inline-flex min-h-11 items-center justify-between gap-2 rounded-md border border-[var(--line)] bg-background px-3 text-left text-sm font-medium hover:bg-black/[.03]"
    >
      {label}
      <ArrowRight className="size-4 text-[var(--muted)]" />
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[var(--line)] py-2 last:border-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function titleize(value: string) {
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
