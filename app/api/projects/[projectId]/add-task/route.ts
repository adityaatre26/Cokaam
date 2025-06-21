import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = await params;
  const { title, description, UserId, priority } = await request.json();

  if (!title || !description || !UserId || !priority) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        creatorId: UserId,
        priority,
      },
    });

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/emit-addtask`,
        {
          projectId,
          task: {
            TaskId: newTask.TaskId,
            title: newTask.title,
            description: newTask.description,
            createdAt: newTask.createdAt,
            updatedAt: newTask.updatedAt,
            priority: newTask.priority,
            status: newTask.status,
            creator: newTask.creatorId,
          },
        }
      );
      console.log("Commit sent to socket server successfully");
    } catch (err) {
      console.error("Error sending commit to socket server:", err);
    }

    return new Response(JSON.stringify(newTask), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return new Response("Failed to create task", { status: 500 });
  }
}
