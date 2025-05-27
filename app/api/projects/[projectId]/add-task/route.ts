import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = await params;
  const { title, description, UserId } = await request.json();

  if (!title || !description || !UserId) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        status: "TODO",
        description,
        projectId,
        creatorId: UserId,
      },
    });

    return new Response(JSON.stringify(newTask), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return new Response("Failed to create task", { status: 500 });
  }
}
