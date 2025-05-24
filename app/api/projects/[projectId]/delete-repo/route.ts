import { Octokit } from "@octokit/rest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { UserId, repoId } = body;

    const repo = await prisma.repos.findUnique({
      where: {
        id: repoId,
      },
    });

    if (!repo) {
      return new Response("Repository not found", { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: {
        UserId: UserId,
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Delete the webhook from Github
    const { repoOwner, repoName, webhookId } = repo;

    const octokit = new Octokit({
      auth: user.accessToken,
    });

    await octokit.rest.repos.deleteWebhook({
      owner: repoOwner,
      repo: repoName,
      hook_id: webhookId!,
    });
    // Delete the repository from the database
    await prisma.repos.delete({
      where: {
        id: repoId,
      },
    });

    return new Response("Repository deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting repository:", error);
    return new Response("Error deleting repository", { status: 500 });
  }
}
