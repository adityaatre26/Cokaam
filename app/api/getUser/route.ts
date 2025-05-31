import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  try {
    console.log(email);
    if (!email) {
      return Response.json(
        {
          success: false,
          message: "Email is required",
          data: null,
        },
        { status: 400 }
      );
    }
    const userData = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        ownedProjects: {
          select: {
            ProjectId: true,
            name: true,
            // description: true,
          },
        },
      },
    });

    console.log(userData);

    if (!userData) {
      return Response.json(
        {
          success: false,
          message: "User not found",
          data: null,
        },
        { status: 404 }
      );
    }

    // Formatting the response in the requested structure
    const formattedResponse = {
      User: {
        id: userData.UserId,
        email: userData.email,
        username: userData.username,
      },
      Projects: userData.ownedProjects,
    };

    return Response.json({
      success: true,
      message: "User found successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "Error fetching user" }, { status: 500 });
  }
}
