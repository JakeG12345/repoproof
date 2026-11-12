export type ClassifiedTree = {
  sourceFiles: string[];
  tests: string[];
  manifests: string[];
  lockfiles: string[];
  workflows: string[];
  docs: string[];
  migrations: string[];
  apiRoutes: string[];
  schemas: string[];
  deployment: string[];
  infrastructure: string[];
  generatedOrIgnored: string[];
  detectedFrameworks: string[];
  applicationType: string;
  limitations: string[];
};

const ignorePatterns = [
  /(^|\/)node_modules\//,
  /(^|\/)vendor\//,
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /(^|\/)coverage\//,
  /(^|\/)generated\//,
  /(^|\/)\.next\//,
  /(^|\/)\.cache\//,
  /\.min\.(js|css)$/,
  /\.map$/,
  /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|tar|mp4|mov)$/i,
];

export function isIgnoredRepositoryPath(path: string) {
  if (path.includes("..") || path.startsWith("/") || path.includes("\\")) return true;
  return ignorePatterns.some((pattern) => pattern.test(path));
}

export function classifyRepositoryTree(paths: string[]): ClassifiedTree {
  const safePaths = paths.filter((path) => !isIgnoredRepositoryPath(path));
  const ignored = paths.filter((path) => isIgnoredRepositoryPath(path));
  const lower = (path: string) => path.toLowerCase();

  const manifests = safePaths.filter((path) =>
    [
      "package.json",
      "pyproject.toml",
      "requirements.txt",
      "poetry.lock",
      "go.mod",
      "cargo.toml",
      "composer.json",
      "gemfile",
      "pom.xml",
      "build.gradle",
      "tsconfig.json",
    ].some((file) => lower(path).endsWith(file)),
  );
  const lockfiles = safePaths.filter((path) =>
    ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "poetry.lock", "uv.lock", "cargo.lock"].some((file) =>
      lower(path).endsWith(file),
    ),
  );
  const tests = safePaths.filter((path) => /(^|\/)(__tests__|tests?|spec)\//i.test(path) || /\.(test|spec)\.[tj]sx?$/.test(path));
  const workflows = safePaths.filter((path) => lower(path).startsWith(".github/workflows/"));
  const docs = safePaths.filter((path) => /(^|\/)(readme|docs?\/|adr\/|architecture)/i.test(path));
  const migrations = safePaths.filter((path) => /(^|\/)(migrations?|db\/migrate|prisma\/migrations)\//i.test(path));
  const apiRoutes = safePaths.filter((path) => /(^|\/)(api|routes?|controllers?|app\/api)\//i.test(path));
  const schemas = safePaths.filter((path) => /(schema|model|migration|drizzle|prisma)/i.test(path));
  const deployment = safePaths.filter((path) => /(dockerfile|docker-compose|vercel\.json|netlify\.toml|render\.yaml|fly\.toml)/i.test(path));
  const infrastructure = safePaths.filter((path) => /\.(tf|tfvars)$|(^|\/)(terraform|pulumi|infra|k8s|helm)\//i.test(path));
  const sourceFiles = safePaths.filter((path) => /\.(tsx?|jsx?|py|go|rs|rb|php|java|cs|kt|swift|dart|c|cc|cpp|h)$/.test(path));
  const detectedFrameworks = detectFrameworks(safePaths);

  return {
    sourceFiles,
    tests,
    manifests,
    lockfiles,
    workflows,
    docs,
    migrations,
    apiRoutes,
    schemas,
    deployment,
    infrastructure,
    generatedOrIgnored: ignored,
    detectedFrameworks,
    applicationType: detectApplicationType(safePaths, detectedFrameworks),
    limitations:
      ignored.length > 0
        ? [`${ignored.length} generated, vendored, binary or unsafe paths were excluded from analysis.`]
        : ["Static file-tree classification cannot establish who designed or authored the code."],
  };
}

function detectFrameworks(paths: string[]) {
  const joined = paths.join("\n").toLowerCase();
  const frameworks = new Set<string>();
  if (joined.includes("next.config") || joined.includes("app/page.tsx")) frameworks.add("Next.js");
  if (joined.includes("vite.config")) frameworks.add("Vite");
  if (joined.includes("tailwind.config") || joined.includes("app/globals.css")) frameworks.add("Tailwind CSS");
  if (joined.includes("drizzle") || joined.includes("db/schema.ts")) frameworks.add("Drizzle ORM");
  if (joined.includes("prisma/schema.prisma")) frameworks.add("Prisma");
  if (joined.includes("pytest") || joined.includes("tests/")) frameworks.add("pytest");
  if (joined.includes("fastapi")) frameworks.add("FastAPI");
  if (joined.includes("django")) frameworks.add("Django");
  if (joined.includes(".github/workflows")) frameworks.add("GitHub Actions");
  return Array.from(frameworks);
}

function detectApplicationType(paths: string[], frameworks: string[]) {
  const joined = paths.join("\n").toLowerCase();
  if (frameworks.includes("Next.js") && joined.includes("stripe")) return "B2B SaaS web application";
  if (joined.includes("etl") || joined.includes("pipeline") || joined.includes("data")) return "Data or automation project";
  if (joined.includes("mobile") || joined.includes("ios") || joined.includes("android")) return "Mobile application";
  if (joined.includes("api/") || joined.includes("routes/")) return "API-backed application";
  return "Software repository";
}
