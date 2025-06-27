import { PrismaClient } from "@prisma/client";
import axios from "axios";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.text();
    console.log("Inside the webhook handler");

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
    } // Get the latest commit (last in the array)
    const latestCommit = commits[commits.length - 1];
    console.log("Latest commit:", latestCommit);

    // Check tasks for the latest commit
    const tasks = await prisma.task.findMany({
      where: {
        projectId: linkedRepo.projectId,
        status: {
          in: ["TODO", "IN_PROGRESS"],
        },
      },
    });

    const matching = tasks.find((task) =>
      latestCommit.message.toLowerCase().includes(task.title.toLowerCase())
    );
    if (matching) {
      console.log("Matching task found:", matching.title);
      // Update the task status to DONE
      // Get user from the database based on GitHub username
      const user = await prisma.user.findFirst({
        where: {
          username: latestCommit.author.username,
        },
      });

      console.log("User found:", user);
      if (!user) {
        console.log("User not found in the database, update the task manually");
        return new Response("User not found, update manually", { status: 404 });
      }
      await prisma.task.update({
        where: {
          TaskId: matching.TaskId,
        },
        data: {
          status: "DONE",
          assigneeId: user.UserId, // Assign the task to the user
        },
      });

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/emit-completeTask`,
          {
            projectId: matching.projectId,
            taskId: matching.TaskId,
            UserId: user.UserId,
            assignee: user.username,
          }
        );
        console.log("Task sent to socket server successfully");
      } catch (error) {
        console.error("Error sending task to socket server:", error);
      }
    }

    console.log("Adding to the database");

    // Store the commit in the database
    const newcum = await prisma.commit.create({
      data: {
        projectId: linkedRepo.projectId,
        message: latestCommit.message,
        author: latestCommit.author.name,
        branch: payload.ref.split("/").pop(),
      },
    });
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/emit-commit`, {
        projectId: newcum.projectId,
        commitId: newcum.id,
        message: latestCommit.message,
        author: latestCommit.author.name,
        branch: payload.ref.split("/").pop(), // Get the branch name from the ref
      });
      console.log("Commit sent to socket server successfully");
    } catch (err) {
      console.error("Error sending commit to socket server:", err);
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.log("Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
