import { PrismaClient } from "@prisma/client";
import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { repoName, repoOwner, repoUrl } = body;
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: {
        email: "aditya.atre26@gmail.com",
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    // This will take the user access token and create a webhook for that repo using github api
    const octokit = new Octokit({
      auth: session.user.accessToken,
    });

    const testrepo = await octokit.rest.repos.get({
      owner: repoOwner,
      repo: repoName,
    });
    console.log("testrepo", testrepo);

    const webhook = await octokit.repos.createWebhook({
      owner: repoOwner,
      repo: repoName,
      config: {
        url: process.env.WEBHOOK_URL,
        content_type: "json",
        secret: process.env.WEBHOOK_SECRET,
      },
      events: ["push"],
    });

    await prisma.repos.create({
      data: {
        repoName,
        repoOwner,
        repoUrl,
        webhookId: webhook.data.id,
        projectId: id,
      },
    });

    return new Response("Repo linked successfully", { status: 200 });
  } catch (error) {
    console.error("Error linking repo:", error);

    return new Response(
      JSON.stringify({
        error,
      }),
      {
        status: 500,
      }
    );
  }
}
