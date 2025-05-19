// Route for fetching all the projects that a user is a member of
// Receives a user ID as a parameter
// Returns a list of projects with their details project name, project ID and role of the user in the project

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  if (!id) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
    });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        memberships: {
          some: {
            userId: id,
          },
        },
      },
      select: {
        ProjectId: true,
        name: true,
        memberships: {
          where: {
            userId: id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(projects), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Failed to fetch projects" }), {
      status: 500,
    });
  }
}
