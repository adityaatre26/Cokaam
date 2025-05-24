import { Octokit } from "@octokit/rest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoName, UserId } = body;

    const user = await prisma.user.findUnique({
      where: {
        UserId: UserId,
      },
    });

    const octokit = new Octokit({
      auth: user?.accessToken,
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const res = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: "Repository created via API",
    });

    if (!res.data) {
      return new Response("Failed to create repository", { status: 500 });
    }

    return new Response(JSON.stringify({ repoUrl: res.data.html_url }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating repo:", error);
    return new Response("Error creating repo", { status: 500 });
  }
}
