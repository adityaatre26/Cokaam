import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { projectId, description, newName, userId } = await request.json();

  try {
    const project = await prisma.project.findUnique({
      where: {
        ProjectId: projectId,
      },
    });

    if (project?.ownerId !== userId) {
      console.log("Person is not the owner of the project");
      throw new Error("Unauthorized: User is not the owner of this project");
    }

    const user = await prisma.user.findUnique({
      where: {
        UserId: userId,
      },
    });

    if (!user) {
      console.log("Owner was not found");
      throw new Error("Unauthorized: User is not the owner of this project");
    }

    // Check if any changes are provided and if they are different from current values
    if (
      (!description && !newName) ||
      (newName && newName === project?.name) ||
      (description && description === project?.description) ||
      (newName === project?.name && description === project?.description)
    ) {
      console.log("No changes detected in the update request");
      throw new Error(
        "Please provide at least one new value different from the current values"
      );
    }

    // Update the project with new values
    const updatedProject = await prisma.project.update({
      where: {
        ProjectId: projectId,
      },
      data: {
        ...(newName && { name: newName }),
        ...(description && { description: description }),
      },
    });

    return new Response(JSON.stringify(updatedProject), { status: 200 });
  } catch (error) {
    console.log("Project not found", error);
    return new Response("Error occured in ", { status: 404 });
  }
}
