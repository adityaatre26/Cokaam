import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { Octokit } from "@octokit/rest";
// Update repo will come here
const prisma = new PrismaClient();

const parseRepoUrl = (repoUrl: string) => {
  const match = repoUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/)?(?:[#?].*)?$/i
  );
  if (!match) throw new Error("Invalid GitHub URL");

  const [, owner, repo] = match;
  return { owner, repo };
};

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = await params;
  const { newUrl, UserId } = await request.json();

  // Check if user owns the project
  const project = await prisma.project.findUnique({
    where: {
      ProjectId: projectId,
      ownerId: UserId,
    },
  });

  if (!project) {
    return new Response(
      "Unauthorized: You don't have permission to modify this project or the user wasn't found",
      {
        status: 403,
      }
    );
  }

  const userData = await prisma.user.findUnique({
    where: {
      UserId: UserId,
    },
  });

  const octokit = new Octokit({
    auth: userData?.accessToken,
  });

  const { owner, repo } = parseRepoUrl(newUrl);
  if (!owner || !repo) {
    return new Response("Invalid repository URL", { status: 400 });
  }

  try {
    await octokit.rest.repos.get({
      owner: owner,
      repo: repo,
    });
  } catch (error) {
    if (error.status === 404) {
      console.log("Repo was not found");
      return new Response("Repo not found", { status: 404 });
    } else {
      // Handle other errors
      console.error("Error fetching repo:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  const repoTBD = await prisma.repos.findUnique({
    where: { projectId: projectId },
  });

  if (!repoTBD) {
    return new Response("Repository not found", { status: 404 });
  }

  // Call delete-repo route
  const deleteResponse = await axios.delete(
    `http://localhost:3000/api/projects/${projectId}/delete-repo`,
    {
      data: {
        UserId: UserId,
        repoId: repoTBD.id,
      },
    }
  );

  if (!deleteResponse.data) {
    console.error("Failed to delete repository:", deleteResponse.data);
    return new Response("Failed to delete repository", { status: 500 });
  }

  // Create new repo with updated URL
  const updatedRepo = await axios.post(
    `http://localhost:3000/api/${projectId}/link-repo`,
    {
      repoName: repo,
      repoOwner: owner,
      repoUrl: newUrl,
      UserId: UserId,
    }
  );

  if (!updatedRepo.data) {
    console.error("Failed to update repository:", updatedRepo.data);
    return new Response("Failed to update repository", { status: 500 });
  }

  console.log("Updated repository:", updatedRepo.data);

  return new Response("Repo updated successfully", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
