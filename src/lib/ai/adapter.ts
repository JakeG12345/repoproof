import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { EvidenceItem, ReportClaim } from "@/src/lib/evidence";
import { ReportClaimSchema, validateReportEvidenceReferences } from "@/src/lib/evidence";
import { demoReport } from "@/src/lib/report-engine";
import { prepareEvidenceForModel, untrustedRepositoryInstruction } from "@/src/lib/safety";
import { appConfig } from "@/src/lib/config";
import { serverConfig } from "@/src/lib/server-config";

const SynthesisOutputSchema = z.object({
  claims: z.array(ReportClaimSchema).min(1),
  usageNotes: z.object({
    inputTokenCount: z.number().int().nonnegative(),
    outputTokenCount: z.number().int().nonnegative(),
    estimatedCostCents: z.number().int().nonnegative(),
  }),
});

export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>;

export type AiAdapter = {
  synthesise(input: {
    evidence: EvidenceItem[];
    roleTitle: string;
    requirements: string[];
    organisationId: string;
  }): Promise<SynthesisOutput>;
};

export class MockAiAdapter implements AiAdapter {
  async synthesise(): Promise<SynthesisOutput> {
    return {
      claims: demoReport.claims,
      usageNotes: {
        inputTokenCount: 0,
        outputTokenCount: 0,
        estimatedCostCents: 0,
      },
    };
  }
}

export class OpenAIResponsesAdapter implements AiAdapter {
  private readonly client: OpenAI;

  constructor(apiKey = serverConfig.openai.apiKey) {
    if (!apiKey) throw new Error("OPENAI_API_KEY is required outside mock mode.");
    this.client = new OpenAI({ apiKey });
  }

  async synthesise(input: {
    evidence: EvidenceItem[];
    roleTitle: string;
    requirements: string[];
    organisationId: string;
  }): Promise<SynthesisOutput> {
    const modelPayload = prepareEvidenceForModel(input.evidence);
    const response = await this.client.responses.parse({
      model: serverConfig.openai.model,
      input: [
        {
          role: "system",
          content: [
            "You generate evidence-backed technical interview brief claims for RepoProof.",
            "Never output hire, reject, score, fraud-risk, AI-code percentage, dishonesty, personality, intelligence, motivation or work-ethic conclusions.",
            "Every claim must reference one or more evidence IDs supplied by the application.",
            "Do not create evidence URLs. Use only evidence IDs.",
            untrustedRepositoryInstruction,
            `Prompt version: ${appConfig.product.promptVersion}.`,
          ].join("\n"),
        },
        {
          role: "user",
          content: JSON.stringify({
            roleTitle: input.roleTitle,
            reviewedRequirements: input.requirements,
            evidencePayload: modelPayload,
          }),
        },
      ],
      text: {
        format: zodTextFormat(SynthesisOutputSchema, "repoproof_synthesis"),
      },
    });

    const parsed = SynthesisOutputSchema.parse(response.output_parsed);
    validateClaims(parsed.claims, input.evidence);
    return parsed;
  }
}

export function validateClaims(claims: ReportClaim[], evidence: EvidenceItem[]) {
  validateReportEvidenceReferences(
    {
      ...demoReport,
      claims,
      contributionEvidence: [],
      engineeringPracticeEvidence: [],
      projectMap: [],
      requirementMatrix: [],
      authorshipVerificationPlan: [],
      interviewPlans: {
        "15": [],
        "30": [],
        "45": [],
        "60": [],
      },
    },
    evidence,
  );
  return true;
}

export function createAiAdapter(): AiAdapter {
  if (serverConfig.mode === "production" && serverConfig.openai.apiKey) {
    return new OpenAIResponsesAdapter();
  }
  return new MockAiAdapter();
}
