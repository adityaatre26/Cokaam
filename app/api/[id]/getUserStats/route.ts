import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const UserId = id;
  if (!UserId) {
    return Response.json(
      {
        success: false,
        message: "UserId is required",
        data: null,
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      UserId: UserId,
    },
    select: {
      ownedProjects: {
        select: {
          _count: {
            select: {
              memberships: true,
            },
          },
        },
      },
      _count: {
        select: {
          assignedTasks: {
            where: {
              status: "DONE",
            },
          },
        },
      },
    },
  });

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

  const stats = {
    totalProjects: user.ownedProjects.length,
    totalMembers: user.ownedProjects.reduce(
      (acc, project) => acc + project._count.memberships,
      0
    ),
    totalTasks: user._count.assignedTasks,
  };

  console.log(user);
  console.log("User Stats:", stats);

  return Response.json(
    {
      success: true,
      message: "User stats retrieved successfully",
      data: stats,
    },
    { status: 200 }
  );
}
