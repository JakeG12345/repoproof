import { serverConfig } from "@/src/lib/server-config";
import { recordDeliveryOnce, sha256Hex, verifyGitHubSignature, verifyTimestampFresh } from "@/src/lib/webhooks";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const deliveryId = request.headers.get("x-github-delivery");
  const eventType = request.headers.get("x-github-event") ?? "unknown";
  const signature = request.headers.get("x-hub-signature-256");
  const timestamp = request.headers.get("x-repoproof-delivery-timestamp");
  const mockAllowed = serverConfig.mode !== "production" && request.headers.get("x-repoproof-mock-webhook") === "true";

  if (!deliveryId) {
    return Response.json({ error: "Missing GitHub delivery id." }, { status: 400 });
  }
  if (!verifyTimestampFresh(timestamp)) {
    return Response.json({ error: "Stale webhook delivery rejected." }, { status: 400 });
  }
  if (!recordDeliveryOnce("github", deliveryId)) {
    return Response.json({ status: "duplicate_ignored", deliveryId });
  }
  if (!mockAllowed) {
    if (!serverConfig.github.webhookSecret) {
      return Response.json({ error: "GitHub webhook secret is not configured." }, { status: 500 });
    }
    if (!verifyGitHubSignature(rawBody, signature, serverConfig.github.webhookSecret)) {
      return Response.json({ error: "Invalid GitHub webhook signature." }, { status: 401 });
    }
  }

  return Response.json({
    status: "processed",
    provider: "github",
    eventType,
    deliveryId,
    bodyHash: sha256Hex(rawBody),
    handled:
      eventType === "installation" ||
      eventType === "installation_repositories" ||
      eventType === "repository" ||
      eventType === "push" ||
      eventType === "pull_request" ||
      eventType === "release",
  });
}
