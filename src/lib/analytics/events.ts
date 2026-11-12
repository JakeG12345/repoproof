export const analyticsEvents = [
  "landing_viewed",
  "pricing_viewed",
  "demo_started",
  "demo_report_viewed",
  "account_created",
  "role_created",
  "job_description_added",
  "candidate_created",
  "candidate_invited",
  "candidate_consent_started",
  "candidate_consent_completed",
  "github_install_started",
  "github_install_completed",
  "repositories_selected",
  "scan_started",
  "repository_fetch_completed",
  "scan_completed",
  "report_viewed",
  "evidence_opened",
  "interview_plan_generated",
  "candidate_response_added",
] as const;

export type AnalyticsEventName = (typeof analyticsEvents)[number];

export function trackEvent(eventName: AnalyticsEventName, metadata: Record<string, unknown> = {}) {
  return {
    eventName,
    metadata: minimiseAnalyticsMetadata(metadata),
    createdAt: new Date().toISOString(),
  };
}

function minimiseAnalyticsMetadata(metadata: Record<string, unknown>) {
  const blockedKeys = new Set(["candidateName", "avatar", "location", "bio", "email", "phone", "realName"]);
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !blockedKeys.has(key)));
}
