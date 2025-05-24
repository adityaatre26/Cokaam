import { PrismaClient } from "@prisma/client";
import axios from "axios";
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

  const { owner, repo } = parseRepoUrl(newUrl);

  if (!owner || !repo) {
    return new Response("Invalid repository URL", { status: 400 });
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
