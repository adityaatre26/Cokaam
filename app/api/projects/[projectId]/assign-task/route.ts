import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { UserId, taskId } = await req.json();
    console.log("Receieved data", req.json());
    if (!UserId || !taskId) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "UserId and taskId are required",
          data: null,
        }),
        { status: 400 }
      );
    }

    // Validate UserId and taskId
    const user = await prisma.user.findUnique({
      where: {
        UserId: UserId,
      },
    });
    if (!user) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "User not found",
          data: null,
        }),
        { status: 404 }
      );
    }

    const task = await prisma.task.findUnique({
      where: {
        TaskId: taskId,
      },
    });
    if (!task) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Task not found",
          data: null,
        }),
        { status: 404 }
      );
    }

    // First, get the current task status
    const currentTask = await prisma.task.findUnique({
      where: {
        TaskId: taskId,
      },
    });

    if (!currentTask) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Task not found",
          data: null,
        }),
        { status: 404 }
      );
    }

    if (currentTask.status === "DONE") {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Cannot assign a task that is already done",
          data: null,
        }),
        { status: 400 }
      );
    }
    // Determine the new status and assignee
    const newStatus = currentTask.status === "TODO" ? "IN_PROGRESS" : "TODO";
    const newAssignee = currentTask.status === "TODO" ? UserId : null;

    const result = await prisma.task.update({
      where: {
        TaskId: taskId,
      },
      data: {
        assigneeId: newAssignee,
        status: newStatus,
      },
    });

    const assigneeData = newAssignee
      ? {
          UserId: newAssignee,
          username: user.username,
        }
      : null;

    console.log("Emitting socket event with data:", {
      projectId: result.projectId,
      taskId: result.TaskId,
      assignee: assigneeData,
      status: newStatus,
    });

    await axios.post(
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/emit-assignTask`,
      {
        projectId: result.projectId,
        taskId: result.TaskId,
        assignee: assigneeData,
        status: newStatus,
      }
    );

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Task assigned successfully",
        data: result,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in assign-task:", error);

    return new Response(
      JSON.stringify({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        data: null,
      }),
      { status: 500 }
    );
  }
}
