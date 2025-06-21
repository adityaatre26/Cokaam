import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }) {
  const { projectId } = await params;
  const { userId, email } = await request.json();
  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
    });
  }
  try {
    const membership = await prisma.memberships.findFirst({
      where: {
        projectId: projectId,
        userId: userId, // user making the request (must be owner)
        role: "OWNER",
      },
    });

    if (!membership) {
      throw new Error("User is not an owner of the project");
    }

    // Check if user exists
    const foundUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!foundUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Check if user is already a member
    const existingMembership = await prisma.memberships.findFirst({
      where: {
        projectId: projectId,
        userId: foundUser.UserId,
      },
    });

    if (existingMembership) {
      return new Response(
        JSON.stringify({ error: "User is already a member" }),
        {
          status: 400,
        }
      );
    }

    // Add user to the project
    const newMembership = await prisma.memberships.create({
      data: {
        userId: foundUser.UserId,
        projectId: projectId,
        role: "MEMBER",
      },
    });

    return new Response(JSON.stringify(newMembership), {
      status: 201,
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Failed to add member" }), {
      status: 500,
    });
  }
}
