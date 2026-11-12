import { githubAppRegistration } from "@/src/lib/github/app";
import { trackEvent } from "@/src/lib/analytics/events";

export async function GET() {
  return Response.json({
    provider: "github",
    registration: githubAppRegistration,
    event: trackEvent("github_install_started", { mode: "setup_route" }),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return Response.json({
    status: "installation_setup_recorded",
    selectedRepositories: body.selectedRepositories ?? [],
    registration: githubAppRegistration,
    event: trackEvent("github_install_completed", { selectedCount: body.selectedRepositories?.length ?? 0 }),
  });
}
