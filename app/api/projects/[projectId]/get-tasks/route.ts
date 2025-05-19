// Purpose of this route
// Go through the tasks table and then get all the tasks that are not completed

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = await params;

  try {
    // Get all tasks for the project
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
        status: "PENDING",
      },
    });

    return new Response(JSON.stringify(tasks), {
      status: 200,
    });
  } catch (error) {
    console.log("Error fetching tasks:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), {
      status: 500,
    });
  }
}
