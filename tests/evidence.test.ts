import { describe, expect, it } from "vitest";
import { demoEvidenceItems } from "@/src/fixtures/demo";
import { demoReport } from "@/src/lib/report-engine";
import { assertReport, validateReportEvidenceReferences } from "@/src/lib/evidence";

describe("evidence-backed report validation", () => {
  it("accepts the complete deterministic demo report", () => {
    expect(() => assertReport(demoReport, demoEvidenceItems)).not.toThrow();
  });

  it("rejects a model claim without evidence ids", () => {
    expect(() =>
      validateReportEvidenceReferences(
        {
          ...demoReport,
          claims: [
            ...demoReport.claims,
            {
              id: "claim_unsupported",
              section: "executive_screening_brief",
              statement: "This unsupported conclusion should not survive validation.",
              evidenceIds: [],
              confidence: "low",
              source: "model",
              limitations: "No linked evidence.",
            },
          ],
        },
        demoEvidenceItems,
      ),
    ).toThrow(/no evidence IDs/);
  });

  it("rejects prohibited employment-decision wording", () => {
    expect(() =>
      validateReportEvidenceReferences(
        {
          ...demoReport,
          claims: [
            {
              ...demoReport.claims[0],
              statement: "The system should reject this candidate.",
            },
          ],
        },
        demoEvidenceItems,
      ),
    ).toThrow(/prohibited wording/);
  });
});
