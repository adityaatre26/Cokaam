import { PrismaClient } from "@prisma/client";
import { AxiosError } from "axios";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    const result = await prisma.task.update({
      where: {
        TaskId: taskId,
      },
      data: {
        status: "DONE",
      },
    });

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
