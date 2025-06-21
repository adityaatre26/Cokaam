import { PrismaClient } from "@prisma/client";
import axios from "axios";
const prisma = new PrismaClient();

export async function DELETE(request: Request, { params }) {
  try {
    const { UserId } = await request.json();
    const { projectId } = await params;

    const user = await prisma.memberships.findFirst({
      where: { userId: UserId, projectId: projectId, role: "OWNER" },
    });

    if (!user) {
      return new Response("Only owner is permitted to delete the project", {
        status: 403,
      });
    }

    const repoTBD = await prisma.repos.findUnique({
      where: { projectId: projectId },
    });

    if (!repoTBD) {
      return new Response("Project not linked to a repo", { status: 404 });
    }

    await axios.delete(
      `http://localhost:3000/api/projects/${projectId}/delete-repo`,
      {
        data: {
          UserId: UserId,
          repoId: repoTBD.id,
        },
      }
    );

    // Delete the project from the database
    const deletedP = await prisma.project.delete({
      where: {
        ProjectId: projectId,
      },
    });

    console.log("Deleted project:", deletedP);

    return new Response("Project deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new Response("Failed to delete project", { status: 500 });
  }
}
