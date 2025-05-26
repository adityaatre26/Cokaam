import { PrismaClient } from "@prisma/client";
import { AxiosError } from "axios";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { UserId, taskId } = await req.json();

    // First, get the current task status
    const currentTask = await prisma.task.findUnique({
      where: {
        TaskId: taskId,
      },
    });

    if (!currentTask) {
      return NextResponse.json(
        { success: false, error: { message: "Task not found" } },
        { status: 404 }
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

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AxiosError) {
      // Handle Axios specific errors
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            response: error.response?.data,
          },
        },
        { status: error.response?.status || 500 }
      );
    }

    if (error instanceof Error) {
      // Handle other known errors
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
