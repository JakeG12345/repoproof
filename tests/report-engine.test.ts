import { describe, expect, it } from "vitest";
import { buildDemoReport, buildInterviewQuestions, buildRequirementMatrix } from "@/src/lib/report-engine";

describe("deterministic report engine", () => {
  it("builds a report with the required sections", () => {
    const report = buildDemoReport();
    expect(report.executiveBrief.length).toBeLessThanOrEqual(5);
    expect(report.projectMap).toHaveLength(3);
    expect(report.requirementMatrix.length).toBeGreaterThan(3);
    expect(report.authorshipVerificationPlan.length).toBeGreaterThanOrEqual(3);
    expect(report.dataLimitations.join(" ")).toContain("Not observed does not mean cannot do");
  });

  it("grounds every interview question in evidence", () => {
    const questions = buildInterviewQuestions("60");
    expect(questions.every((question) => question.evidenceIds.length > 0)).toBe(true);
  });

  it("does not turn not observed into a score penalty", () => {
    const matrix = buildRequirementMatrix();
    const cloud = matrix.find((item) => item.requirement === "Cloud infrastructure");
    expect(cloud?.status).toBe("not_observed");
    expect(cloud?.limitations).toContain("Not observed is not equivalent to lacking the skill");
  });
});
