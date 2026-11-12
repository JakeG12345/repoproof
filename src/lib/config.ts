export type PricePlanKey =
  | "freeDemo"
  | "singleReport"
  | "humanReviewed"
  | "recruiterStarter"
  | "team"
  | "foundingPilot";

export type PricePlan = {
  key: PricePlanKey;
  label: string;
  amountCents: number;
  currency: "AUD";
  cadence: "free" | "one_off" | "monthly";
  reportCredits: number;
  humanReviewed: boolean;
  stripePriceEnv: string;
  notes: string;
};

export const appConfig = {
  brand: {
    name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "RepoProof",
    logoText: process.env.NEXT_PUBLIC_BRAND_LOGO_TEXT ?? "RP",
    primary: process.env.NEXT_PUBLIC_BRAND_PRIMARY ?? "#1f6f68",
    accent: process.env.NEXT_PUBLIC_BRAND_ACCENT ?? "#b45309",
    copy:
      process.env.NEXT_PUBLIC_BRAND_COPY ??
      "Turn a GitHub profile into an evidence-backed technical interview brief.",
    alternativeCopy:
      "Stop guessing from stars and repository names. See what the candidate appears to have built, inspect the evidence, and ask better interview questions.",
  },
  product: {
    reportWarning:
      "This report summarises limited technical evidence. It must not be used as the sole basis for an employment decision. Review the linked evidence, interview the candidate and consider relevant context.",
    publicEvidenceLabel:
      "Public GitHub evidence only. Candidate context has not yet been confirmed.",
    notObservedWarning: "Not observed is not equivalent to lacking the skill.",
    reportVersion: "2026.08.mvp",
    evidenceVersion: "evidence.v1",
    extractorVersion: "extractor.v1",
    promptVersion: "synthesis.v1",
    defaultRetentionDays: 90,
  },
  pricing: {
    freeDemo: {
      key: "freeDemo",
      label: "Local trial",
      amountCents: 0,
      currency: "AUD",
      cadence: "free",
      reportCredits: 1,
      humanReviewed: false,
      stripePriceEnv: "",
      notes: "One local workspace report while you validate the workflow.",
    },
    singleReport: {
      key: "singleReport",
      label: "Single report",
      amountCents: 3900,
      currency: "AUD",
      cadence: "one_off",
      reportCredits: 1,
      humanReviewed: false,
      stripePriceEnv: "STRIPE_SINGLE_REPORT_PRICE_ID",
      notes: "One public-profile analysis, limited to three repositories.",
    },
    humanReviewed: {
      key: "humanReviewed",
      label: "Human-reviewed report",
      amountCents: 9900,
      currency: "AUD",
      cadence: "one_off",
      reportCredits: 1,
      humanReviewed: true,
      stripePriceEnv: "STRIPE_HUMAN_REVIEW_PRICE_ID",
      notes: "Automated analysis plus report-quality review.",
    },
    recruiterStarter: {
      key: "recruiterStarter",
      label: "Recruiter starter",
      amountCents: 14900,
      currency: "AUD",
      cadence: "monthly",
      reportCredits: 10,
      humanReviewed: false,
      stripePriceEnv: "STRIPE_STARTER_PRICE_ID",
      notes: "Ten automated reports per month for one organisation.",
    },
    team: {
      key: "team",
      label: "Team",
      amountCents: 39900,
      currency: "AUD",
      cadence: "monthly",
      reportCredits: 40,
      humanReviewed: false,
      stripePriceEnv: "STRIPE_TEAM_PRICE_ID",
      notes: "Forty reports per month with multiple team members.",
    },
    foundingPilot: {
      key: "foundingPilot",
      label: "Founding pilot",
      amountCents: 49900,
      currency: "AUD",
      cadence: "one_off",
      reportCredits: 10,
      humanReviewed: true,
      stripePriceEnv: "STRIPE_FOUNDING_PILOT_PRICE_ID",
      notes:
        "Up to ten human-reviewed reports and manual onboarding. No legal, employment or security assurance is included.",
    },
  } satisfies Record<PricePlanKey, PricePlan>,
};

export const pricePlans = Object.values(appConfig.pricing);

export function formatPrice(plan: PricePlan) {
  if (plan.amountCents === 0) return "Free";
  const amount = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(plan.amountCents / 100);
  return plan.cadence === "monthly" ? `${amount}/mo` : amount;
}
