import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = await params;

  try {
    // Find all projects where the user is the owner
    const userOwnedProjects = await prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        githubRepo: true,
      },
    });

    // Delete each project (this will trigger cascade deletes for memberships and tasks)
    for (const project of userOwnedProjects) {
      // The delete-project route already handles repo webhook deletion
      await axios.delete(
        `http://localhost:3000/api/projects/${project.ProjectId}/delete-project`,
        {
          data: {
            UserId: userId,
          },
        }
      );
    }

    // Finally delete the user (this will cascade delete any remaining memberships where they were just a member)
    const deletedUser = await prisma.user.delete({
      where: {
        UserId: userId,
      },
    });

    return new Response(
      JSON.stringify({
        message: "User and all associated data deleted successfully",
        user: deletedUser,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to delete user and associated data",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
