const githubHostnames = new Set(["github.com", "www.github.com"]);
const usernamePattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const repoPattern = /^[A-Za-z0-9_.-]+$/;

export type NormalisedGitHubTarget =
  | {
      kind: "profile";
      owner: string;
      canonicalUrl: string;
    }
  | {
      kind: "repository";
      owner: string;
      repo: string;
      canonicalUrl: string;
    };

export function normaliseGitHubInput(input: string): NormalisedGitHubTarget {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter an exact GitHub username or GitHub URL.");

  if (usernamePattern.test(trimmed) && !trimmed.includes(".")) {
    return {
      kind: "profile",
      owner: trimmed,
      canonicalUrl: `https://github.com/${trimmed}`,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error("GitHub target must be an exact username or valid GitHub URL.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!githubHostnames.has(hostname)) {
    throw new Error("Only github.com URLs are supported. Lookalike domains are rejected.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Credentials are not allowed in GitHub URLs.");
  }

  const [owner, repo, ...extra] = parsed.pathname.split("/").filter(Boolean);
  if (!owner || !usernamePattern.test(owner)) {
    throw new Error("GitHub URL must include an exact account name.");
  }

  if (!repo) {
    return {
      kind: "profile",
      owner,
      canonicalUrl: `https://github.com/${owner}`,
    };
  }

  if (!repoPattern.test(repo) || extra.length > 0) {
    throw new Error("Repository URLs must be exactly https://github.com/{owner}/{repo}.");
  }

  return {
    kind: "repository",
    owner,
    repo,
    canonicalUrl: `https://github.com/${owner}/${repo}`,
  };
}

export function buildGitHubSourceUrl(
  repositoryFullName: string,
  branch: string,
  path: string,
  startLine?: number,
  endLine?: number,
) {
  const lineHash =
    startLine && endLine && endLine !== startLine
      ? `#L${startLine}-L${endLine}`
      : startLine
        ? `#L${startLine}`
        : "";
  return `https://github.com/${repositoryFullName}/blob/${encodeURIComponent(branch)}/${path}${lineHash}`;
}
