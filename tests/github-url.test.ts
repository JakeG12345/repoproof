import { describe, expect, it } from "vitest";
import { classifyRepositoryTree } from "@/src/lib/github/file-classifier";
import { normaliseGitHubInput } from "@/src/lib/github/url";
import { maliciousRepositoryFixture } from "@/src/fixtures/malicious-repository";

describe("GitHub target validation", () => {
  it("accepts exact usernames and canonical repository URLs", () => {
    expect(normaliseGitHubInput("octocat")).toEqual({
      kind: "profile",
      owner: "octocat",
      canonicalUrl: "https://github.com/octocat",
    });
    expect(normaliseGitHubInput("https://github.com/octocat/hello-world")).toEqual({
      kind: "repository",
      owner: "octocat",
      repo: "hello-world",
      canonicalUrl: "https://github.com/octocat/hello-world",
    });
  });

  it("rejects lookalike domains, path traversal and non-exact paths", () => {
    expect(() => normaliseGitHubInput("https://github.example.com/octocat")).toThrow(/github.com/);
    expect(() => normaliseGitHubInput("https://githüb.com/octocat")).toThrow(/github.com/);
    expect(() => normaliseGitHubInput("https://github.com/octocat/repo/pulls")).toThrow(/exactly/);
  });

  it("excludes generated and unsafe paths during classification", () => {
    const tree = classifyRepositoryTree(maliciousRepositoryFixture.fileTree);
    expect(tree.generatedOrIgnored).toContain("../attempted-path-traversal.md");
    expect(tree.generatedOrIgnored).toContain("generated/api-client.ts");
  });
});
