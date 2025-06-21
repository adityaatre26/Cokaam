import { PrismaClient } from "@prisma/client";
import { Octokit } from "@octokit/rest";
const prisma = new PrismaClient();

export async function POST(request: Request, { params }) {
  try {
    const body = await request.json();
    const { repoName, repoOwner, repoUrl, UserId } = body;

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: {
        UserId: UserId,
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    // This will take the user access token and create a webhook for that repo using github api
    const octokit = new Octokit({
      auth: user.accessToken,
    });

    // const testrepo = await octokit.rest.repos.get({
    //   owner: repoOwner,
    //   repo: repoName,
    // });
    // console.log("testrepo", testrepo);

    try {
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
    } catch (error) {
      console.log("Error occured while creating the webhook", error);
      return new Response(
        JSON.stringify({
          error,
        }),
        {
          status: 500,
        }
      );
    }

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
