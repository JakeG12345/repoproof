import type { RoleRequirement } from "@/src/lib/evidence";

const categories = [
  ["typescript", "programming language"],
  ["javascript", "programming language"],
  ["python", "programming language"],
  ["react", "frontend"],
  ["next.js", "framework"],
  ["node", "backend"],
  ["api", "backend"],
  ["postgres", "database"],
  ["sql", "database"],
  ["stripe", "payments"],
  ["test", "testing"],
  ["ci", "DevOps"],
  ["docker", "DevOps"],
  ["security", "security"],
  ["accessibility", "frontend"],
] as const;

export function extractRequirementsFromJobDescription(jobDescription: string): RoleRequirement[] {
  const lower = jobDescription.toLowerCase();
  const requirements = categories
    .filter(([keyword]) => lower.includes(keyword))
    .map(([keyword, category], index) => ({
      id: `req_${String(index + 1).padStart(2, "0")}`,
      name: keyword === "test" ? "Testing strategy" : titleCase(keyword),
      category,
      requiredLevel: lower.includes(`${keyword} preferred`) ? ("preferred" as const) : ("required" as const),
      importance: ["security", "postgres", "api", "typescript"].includes(keyword) ? ("high" as const) : ("medium" as const),
      minimumEvidenceExpected: "Evidence in repository structure, source links, configuration or candidate context.",
      recruiterNotes: "",
      reviewedByRecruiter: false,
    })) satisfies RoleRequirement[];

  if (requirements.length > 0) return requirements;

  return [
    {
      id: "req_01",
      name: "Relevant application code",
      category: "system design",
      requiredLevel: "required",
      importance: "high",
      minimumEvidenceExpected: "Evidence of project structure, source files, tests or architecture decisions.",
      recruiterNotes: "",
      reviewedByRecruiter: false,
    },
  ];
}

function titleCase(value: string) {
  return value
    .split(/[.\s-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
