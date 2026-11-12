import "server-only";
import { createAppAuth } from "@octokit/auth-app";
import { serverConfig } from "@/src/lib/server-config";

export const githubAppRegistration = {
  callbackUrl: `${serverConfig.appUrl}/api/github/callback`,
  setupUrl: `${serverConfig.appUrl}/api/github/setup`,
  webhookUrl: `${serverConfig.appUrl}/api/github/webhook`,
  permissions: {
    metadata: "read",
    contents: "read",
    pull_requests: "read",
    issues: "read",
    actions: "read",
  },
  events: ["installation", "installation_repositories", "repository", "push", "pull_request", "release"],
  notes: [
    "Request read-only permissions only.",
    "Do not request all repositories by default.",
    "Installation tokens are short-lived and never sent to the browser.",
  ],
};

export async function createInstallationToken(installationId: string) {
  if (!serverConfig.github.appId || !serverConfig.github.privateKeyBase64) {
    throw new Error("GitHub App credentials are not configured.");
  }

  const privateKey = Buffer.from(serverConfig.github.privateKeyBase64, "base64").toString("utf8");
  const auth = createAppAuth({
    appId: serverConfig.github.appId,
    privateKey,
    installationId,
  });
  const result = await auth({ type: "installation" });
  return {
    token: result.token,
    expiresAt: result.expiresAt,
    permissions: result.permissions,
  };
}
