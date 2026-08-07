// Commits one or more files to GitHub as a single atomic commit, using the
// Git Data API (blobs → tree → commit → ref update) rather than the simpler
// Contents API. The Contents API only writes one file per call, and a single
// editor save often touches 2+ files at once (e.g. a new lesson's JSON plus
// its section's index) — doing that as separate calls risks a Vercel
// redeploy landing between them with a broken reference. This makes every
// editor save land as one commit or not at all.
//
// Requires GITHUB_TOKEN (fine-grained PAT, contents:write on the one repo),
// GITHUB_REPO ("owner/repo"), and GITHUB_BRANCH (defaults to "main").

const GITHUB_API = "https://api.github.com";

export interface FileWrite {
  path: string; // repo-relative, e.g. "src/data/sections/new-section/en.json"
  content: string; // raw text (UTF-8); base64-encoded internally before upload
}

export class GitHubCommitError extends Error {}

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repo) {
    throw new GitHubCommitError(
      "Missing GITHUB_TOKEN or GITHUB_REPO environment variable."
    );
  }
  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    throw new GitHubCommitError(
      `GITHUB_REPO must be "owner/repo", got "${repo}".`
    );
  }
  return { token, owner, name, branch };
}

async function gh<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GitHubCommitError(
      `GitHub API ${init?.method ?? "GET"} ${path} failed: ${res.status} ${body}`
    );
  }
  return res.json() as Promise<T>;
}

/** Reads a file's current text content from the repo (for prefilling the editor). */
export async function readFile(path: string): Promise<string | undefined> {
  const { token, owner, name, branch } = config();
  try {
    const data = await gh<{ content: string; encoding: string }>(
      token,
      `/repos/${owner}/${name}/contents/${path}?ref=${branch}`
    );
    if (data.encoding !== "base64") return undefined;
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return undefined;
  }
}

/**
 * Commits every file in `files` as one atomic commit on the configured
 * branch. Returns the new commit SHA. Throws GitHubCommitError on failure —
 * callers should surface that to the editor UI as "save failed, nothing
 * was published" rather than a partial write, since nothing is written
 * until the final ref update succeeds.
 */
export async function commitFiles(
  files: FileWrite[],
  message: string
): Promise<string> {
  if (files.length === 0) {
    throw new GitHubCommitError("commitFiles called with no files.");
  }
  const { token, owner, name, branch } = config();
  const base = `/repos/${owner}/${name}`;

  const ref = await gh<{ object: { sha: string } }>(
    token,
    `${base}/git/ref/heads/${branch}`
  );
  const latestCommitSha = ref.object.sha;

  const latestCommit = await gh<{ tree: { sha: string } }>(
    token,
    `${base}/git/commits/${latestCommitSha}`
  );
  const baseTreeSha = latestCommit.tree.sha;

  const blobs = await Promise.all(
    files.map((f) =>
      gh<{ sha: string }>(token, `${base}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content: Buffer.from(f.content, "utf-8").toString("base64"),
          encoding: "base64",
        }),
      })
    )
  );

  const newTree = await gh<{ sha: string }>(token, `${base}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: files.map((f, i) => ({
        path: f.path,
        mode: "100644",
        type: "blob",
        sha: blobs[i].sha,
      })),
    }),
  });

  const newCommit = await gh<{ sha: string }>(token, `${base}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: newTree.sha,
      parents: [latestCommitSha],
    }),
  });

  // Not force-pushed: if the branch moved since we read `ref` above, this
  // 422s instead of silently overwriting someone else's commit. The editor
  // UI should retry (which re-reads the new HEAD) rather than force it.
  await gh(token, `${base}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  });

  return newCommit.sha;
}
