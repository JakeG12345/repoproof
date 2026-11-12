import "server-only";
import { Octokit } from "@octokit/rest";
import { serverConfig } from "@/src/lib/server-config";
import { demoRepositories } from "@/src/fixtures/demo";
import { classifyRepositoryTree, type ClassifiedTree } from "@/src/lib/github/file-classifier";
import { normaliseGitHubInput, type NormalisedGitHubTarget } from "@/src/lib/github/url";

export type RepositoryDiscovery = {
  id: string;
  fullName: string;
  owner: string;
  name: string;
  visibility: "public" | "private";
  fork: boolean;
  archived: boolean;
  template: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  languages: Record<string, number>;
  topics: string[];
  canonicalUrl: string;
  stars?: number;
  forks?: number;
  classification: ClassifiedTree;
  limitations: string[];
};

export type ContributionRecord = {
  repositoryFullName: string;
  type: "commit" | "pull_request" | "review" | "issue" | "release";
  sourceUrl: string;
  title: string;
  occurredAt: string;
  commitSha?: string;
  pullRequestNumber?: number;
  issueNumber?: number;
  filesChanged?: string[];
  limitations: string;
};

export type GitHubAdapter = {
  validateTarget(input: string): Promise<NormalisedGitHubTarget>;
  discoverRepositories(target: NormalisedGitHubTarget): Promise<RepositoryDiscovery[]>;
  fetchContributionRecords(owner: string, repositories: string[]): Promise<ContributionRecord[]>;
};

export class MockGitHubAdapter implements GitHubAdapter {
  async validateTarget(input: string) {
    return normaliseGitHubInput(input);
  }

  async discoverRepositories() {
    return demoRepositories.map((repository) => ({
      id: repository.id,
      fullName: repository.fullName,
      owner: repository.owner,
      name: repository.name,
      visibility: repository.visibility,
      fork: repository.fork,
      archived: repository.archived,
      template: repository.template,
      description: repository.description,
      createdAt: repository.createdAt,
      updatedAt: repository.updatedAt,
      pushedAt: repository.pushedAt,
      defaultBranch: repository.defaultBranch,
      languages: repository.languages,
      topics: repository.topics,
      canonicalUrl: repository.canonicalUrl,
      stars: repository.secondaryMetadata.stars,
      forks: repository.secondaryMetadata.forks,
      classification: classifyRepositoryTree(repository.fileTree),
      limitations: repository.limitations,
    }));
  }

  async fetchContributionRecords() {
    return demoRepositories.flatMap((repository) =>
      repository.contributions.map((contribution) => ({
        repositoryFullName: repository.fullName,
        ...contribution,
      })),
    );
  }
}

export class PublicGitHubApiAdapter implements GitHubAdapter {
  private readonly octokit: Octokit;

  constructor(token = serverConfig.github.publicToken) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: "RepoProof/0.1",
    });
  }

  async validateTarget(input: string) {
    const target = normaliseGitHubInput(input);
    if (target.kind === "profile") {
      await this.octokit.rest.users.getByUsername({ username: target.owner });
    } else {
      await this.octokit.rest.repos.get({ owner: target.owner, repo: target.repo });
    }
    return target;
  }

  async discoverRepositories(target: NormalisedGitHubTarget): Promise<RepositoryDiscovery[]> {
    if (target.kind === "repository") {
      return [await this.getRepository(target.owner, target.repo)];
    }

    const repos = await this.octokit.paginate(this.octokit.rest.repos.listForUser, {
      username: target.owner,
      type: "owner",
      per_page: 50,
      sort: "updated",
    });

    const selected = repos.filter((repo) => !repo.private).slice(0, 20);
    return Promise.all(selected.map((repo) => this.getRepository(repo.owner.login, repo.name)));
  }

  async fetchContributionRecords(owner: string, repositories: string[]) {
    const records: ContributionRecord[] = [];
    for (const fullName of repositories.slice(0, 5)) {
      const [repoOwner, repo] = fullName.split("/");
      if (!repoOwner || !repo) continue;
      const commits = await this.octokit.rest.repos.listCommits({
        owner: repoOwner,
        repo,
        author: owner,
        per_page: 20,
      });
      for (const commit of commits.data) {
        records.push({
          repositoryFullName: fullName,
          type: "commit",
          sourceUrl: commit.html_url,
          title: commit.commit.message.split("\n")[0] ?? "Commit",
          occurredAt: commit.commit.author?.date ?? commit.commit.committer?.date ?? new Date().toISOString(),
          commitSha: commit.sha,
          filesChanged: [],
          limitations: "Commit attribution is based on GitHub API author matching only.",
        });
      }
    }
    return records;
  }

  private async getRepository(owner: string, repo: string): Promise<RepositoryDiscovery> {
    const repository = await this.octokit.rest.repos.get({ owner, repo });
    const languages = await this.octokit.rest.repos.listLanguages({ owner, repo });
    const tree = await this.fetchTree(owner, repo, repository.data.default_branch);

    return {
      id: String(repository.data.id),
      fullName: repository.data.full_name,
      owner: repository.data.owner.login,
      name: repository.data.name,
      visibility: repository.data.private ? "private" : "public",
      fork: repository.data.fork,
      archived: repository.data.archived,
      template: Boolean(repository.data.is_template),
      description: repository.data.description ?? "",
      createdAt: repository.data.created_at ?? new Date().toISOString(),
      updatedAt: repository.data.updated_at ?? new Date().toISOString(),
      pushedAt: repository.data.pushed_at ?? repository.data.updated_at ?? new Date().toISOString(),
      defaultBranch: repository.data.default_branch,
      languages: languages.data,
      topics: repository.data.topics ?? [],
      canonicalUrl: repository.data.html_url,
      stars: repository.data.stargazers_count,
      forks: repository.data.forks_count,
      classification: classifyRepositoryTree(tree),
      limitations: [
        "Public API mode can miss private work, squash-merged history and commits made with unlinked email addresses.",
      ],
    };
  }

  private async fetchTree(owner: string, repo: string, branch: string) {
    const ref = await this.octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const tree = await this.octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: ref.data.object.sha,
      recursive: "true",
    });
    return tree.data.tree
      .map((entry) => entry.path)
      .filter((path): path is string => Boolean(path))
      .slice(0, 2000);
  }
}

export function createGitHubAdapter(): GitHubAdapter {
  if (serverConfig.mode === "mock" || serverConfig.mode === "demo") {
    return new MockGitHubAdapter();
  }
  return new PublicGitHubApiAdapter();
}
