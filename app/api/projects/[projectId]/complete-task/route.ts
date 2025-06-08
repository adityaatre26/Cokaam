import { PrismaClient } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { taskId, userId } = await req.json();
    console.log("Receieved data to complete task:", taskId, userId);
    const user = await prisma.user.findFirst({
      where: {
        UserId: userId,
      },
    });

    if (!user) {
      console.log("User not found");
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }

    console.log(user);

    const result = await prisma.task.update({
      where: {
        TaskId: taskId,
      },
      data: {
        status: "DONE",
        assigneeId: user.UserId,
      },
    });

    console.log("Task updated successfully:", result);
    await axios.post("http://localhost:4000/emit-completeTask", {
      projectId: result.projectId,
      taskId: result.TaskId,
    });

    console.log("Task sent to socket socket server successfully");

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof AxiosError) {
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
