import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = await params;
  const { userId, memberToRemoveId } = await request.json();

  if (!userId || !memberToRemoveId) {
    return new Response(
      JSON.stringify({
        error: "Both userId and memberToRemoveId are required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Check if the requesting user is the owner
    const requesterMembership = await prisma.memberships.findFirst({
      where: {
        projectId: projectId,
        userId: userId,
        role: "OWNER",
      },
    });

    if (!requesterMembership) {
      return new Response(
        JSON.stringify({ error: "Only project owners can remove members" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if the member to remove exists and is not an owner
    const membershipToRemove = await prisma.memberships.findFirst({
      where: {
        projectId: projectId,
        userId: memberToRemoveId,
      },
    });

    if (!membershipToRemove) {
      return new Response(
        JSON.stringify({ error: "Member not found in this project" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (membershipToRemove.role === "OWNER") {
      return new Response(
        JSON.stringify({ error: "Cannot remove a project owner" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Remove the membership
    const deletedMembership = await prisma.memberships.delete({
      where: {
        id: membershipToRemove.id,
      },
    });

    // Unassign any tasks assigned to this member in this project
    await prisma.task.updateMany({
      where: {
        projectId: projectId,
        assigneeId: memberToRemoveId,
        status: "IN_PROGRESS",
      },
      data: {
        assigneeId: null,
        status: "TODO",
      },
    });

    return new Response(
      JSON.stringify({
        message: "Member removed successfully",
        deletedMembership,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error removing member:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to remove member",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
