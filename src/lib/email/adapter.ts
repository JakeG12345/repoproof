import "server-only";
import { Resend } from "resend";
import { serverConfig } from "@/src/lib/server-config";

export type EmailAdapter = {
  sendCandidateInvitation(input: {
    to: string;
    organisationName: string;
    invitationUrl: string;
    expiresAt: string;
  }): Promise<{ id: string; provider: "resend" | "mock" }>;
};

export class MockEmailAdapter implements EmailAdapter {
  async sendCandidateInvitation() {
    return { id: "mock_email_candidate_invitation", provider: "mock" as const };
  }
}

export class ResendEmailAdapter implements EmailAdapter {
  private readonly resend: Resend;

  constructor(apiKey = serverConfig.resend.apiKey) {
    if (!apiKey) throw new Error("RESEND_API_KEY is required outside mock email mode.");
    this.resend = new Resend(apiKey);
  }

  async sendCandidateInvitation(input: {
    to: string;
    organisationName: string;
    invitationUrl: string;
    expiresAt: string;
  }) {
    const result = await this.resend.emails.send({
      from: serverConfig.resend.from,
      to: input.to,
      subject: `${input.organisationName} requested a RepoProof review`,
      text: [
        `${input.organisationName} requested a GitHub evidence report.`,
        `Open the signed invitation: ${input.invitationUrl}`,
        `This invitation expires at ${input.expiresAt}.`,
      ].join("\n"),
    });
    return { id: result.data?.id ?? "resend_unknown", provider: "resend" as const };
  }
}

export function createEmailAdapter(): EmailAdapter {
  if (serverConfig.mode === "production" && serverConfig.resend.apiKey) {
    return new ResendEmailAdapter();
  }
  return new MockEmailAdapter();
}
