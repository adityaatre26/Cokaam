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

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    console.log(user);

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
          data: null,
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "User found successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "Error fetching user" }, { status: 500 });
  }
}
