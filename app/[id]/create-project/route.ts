import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchGithubRepo(repoUrl: string) {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/i);
  if (!m) throw new Error("Invalid GitHub URL");

  const [, owner, repo] = m;
  const r = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ""}`,
    },
  });
  if (!r.ok) {
    throw new Error("Failed to fetch GitHub repo");
  }
  const repoData = await r.json();

  return {
    repoName: repoData.name as string,
    repoOwner: repoData.owner.login as string,
  };
}

export async function POST(request: Request) {
  const { name, UserId, repoUrl } = await request.json();
  if (!name || !UserId || !repoUrl) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    const res = await prisma.$transaction(async (db) => {
      // Create a new project
      const project = await db.project.create({
        data: {
          name,
          ownerId: UserId,
        },
      });

      // Fetch github repo details
      const { repoName, repoOwner } = await fetchGithubRepo(repoUrl);

      // Add repo to the repos
      await db.repos.create({
        data: {
          repoName,
          repoOwner,
          repoUrl,
          projectId: project.ProjectId,
        },
      });

      // Add owner to the member table
      await db.memberships.create({
        data: {
          userId: UserId,
          projectId: project.ProjectId,
          role: "OWNER",
        },
      });

      return project;
    });

    return new Response(JSON.stringify(res), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return new Response("Error creating project", { status: 500 });
  }
}
