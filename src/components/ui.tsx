import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSearch,
  GitBranch,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { clsx } from "clsx";
import { appConfig } from "@/src/lib/config";
import type { EvidenceItem } from "@/src/lib/evidence";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 text-sm font-semibold no-underline">
      <span className="grid size-9 place-items-center rounded-md bg-[var(--brand-primary)] text-white">
        {appConfig.brand.logoText}
      </span>
      <span>{appConfig.brand.name}</span>
    </Link>
  );
}

export function AppNav() {
  const links = [
    ["Dashboard", "/dashboard"],
    ["Jobs", "/jobs"],
    ["Candidates", "/candidates"],
    ["Reviews", "/admin/review"],
    ["Settings", "/settings"],
  ];
  return (
    <header className="no-print sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--nav)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-[var(--muted)] no-underline hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button href="/pricing" variant="secondary">
            Pricing
          </Button>
          <Button href="/candidates/new" icon={<ArrowRight className="size-4" />}>
            New Scan
          </Button>
        </div>
      </div>
    </header>
  );
}

export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AppNav />
      <main>{children}</main>
    </div>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  icon,
  type = "button",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
  type?: "button" | "submit";
}) {
  const className = clsx(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium no-underline shadow-[0_1px_0_rgba(23,32,29,.05)] transition",
    variant === "primary" && "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)]",
    variant === "secondary" && "border border-[var(--line)] bg-[var(--surface)] text-foreground hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]",
    variant === "ghost" && "text-[var(--brand-primary)] hover:bg-[var(--surface-2)]",
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
        {icon}
      </Link>
    );
  }
  return (
    <button type={type} className={className}>
      {children}
      {icon}
    </button>
  );
}

export function Section({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-[var(--brand-accent)]">{eyebrow}</p> : null}
          <h2 className="max-w-3xl text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">{title}</h2>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx("rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_1px_2px_rgba(23,32,29,.06)]", className)}>{children}</div>;
}

export function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_1px_1px_rgba(23,32,29,.04)]">
      <p className="text-xs font-medium uppercase tracking-normal text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{detail}</p>
    </div>
  );
}

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "observed" | "candidate" | "ambiguous" | "gap" | "review";
}) {
  return (
    <span
      className={clsx(
        "inline-flex min-h-7 items-center rounded-md border px-2.5 text-xs font-medium",
        tone === "neutral" && "border-[var(--line)] bg-background text-[var(--muted)]",
        tone === "observed" && "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
        tone === "candidate" && "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200",
        tone === "ambiguous" && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
        tone === "gap" && "border-stone-300 bg-stone-50 text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200",
        tone === "review" && "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200",
      )}
    >
      {label}
    </span>
  );
}

export function EvidenceLink({ evidence }: { evidence: EvidenceItem }) {
  return (
    <details className="rounded-lg border border-[var(--line)] bg-background p-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
        <span className="flex min-w-0 items-center gap-2">
          <FileSearch className="size-4 shrink-0 text-[var(--brand-primary)]" />
          <span className="truncate">{evidence.claim}</span>
        </span>
        <StatusBadge label={evidence.observationType.replaceAll("_", " ")} tone={toneForObservation(evidence.observationType)} />
      </summary>
      <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
        <p>{evidence.interpretation}</p>
        <p>{evidence.limitations}</p>
        <a
          href={evidence.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[var(--brand-primary)]"
        >
          Source <ExternalLink className="size-3.5" />
        </a>
      </div>
    </details>
  );
}

export function WarningBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
      <div className="flex gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0" />
        <div>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center">
      <Clock3 className="mx-auto size-8 text-[var(--muted)]" />
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--muted)]">{detail}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function TrustStrip() {
  const items = [
    ["Evidence linked", CheckCircle2],
    ["Secrets server-side", LockKeyhole],
    ["Decision support only", ShieldCheck],
  ] as const;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(([label, Icon]) => (
        <div key={String(label)} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-medium">
          <Icon className="size-5 text-[var(--brand-primary)]" />
          {label}
        </div>
      ))}
    </div>
  );
}

export function GitHubLabel({ value }: { value: string }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-2 rounded-md border border-[var(--line)] bg-background px-2.5 text-sm">
      <GitBranch className="size-4" />
      {value}
    </span>
  );
}

function toneForObservation(observationType: EvidenceItem["observationType"]) {
  if (observationType === "observed") return "observed";
  if (observationType === "candidate_claim") return "candidate";
  if (observationType === "ambiguous") return "ambiguous";
  if (observationType === "not_observed" || observationType === "unknown") return "gap";
  return "neutral";
}
