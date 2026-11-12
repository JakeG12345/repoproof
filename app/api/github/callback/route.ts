import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const installationId = request.nextUrl.searchParams.get("installation_id");
  const setupAction = request.nextUrl.searchParams.get("setup_action");

  return Response.json({
    status: code || installationId ? "received" : "missing_parameters",
    installationId,
    setupAction,
    next: "/settings/github",
  });
}
