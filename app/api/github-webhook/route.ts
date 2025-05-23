import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.text();

    if (req.headers.get("x-github-event") === "ping") {
      return new Response("Pong", { status: 200 });
    }

    const sig = req.headers.get("x-hub-signature-256");
    const secret = process.env.WEBHOOK_SECRET;

    const hmac = crypto.createHmac("sha256", secret!);
    const digest = "sha256=" + hmac.update(body).digest("hex");

    if (sig !== digest) {
      return new Response("Invalid signature", { status: 403 });
    }

    const payload = JSON.parse(body);
    const repoUrl = payload.repository.html_url;
    const commits = payload.commits;

    const linkedRepo = await prisma.repos.findFirst({
      where: {
        repoUrl,
      },
    });

    if (!linkedRepo) {
      return new Response("Repo not found", { status: 404 });
    }

    for (const commit of commits) {
      console.log("commit:", commit);
      const matching = await prisma.task.findFirst({
        where: {
          projectId: linkedRepo.projectId,
          title: {
            contains: commit.message,
          },
        },
      });

      if (matching) {
        await prisma.task.update({
          where: {
            TaskId: matching.TaskId,
          },
          data: {
            status: "COMPLETED",
          },
        });
      }
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.log("Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
