// Route for fetching project details
// Receives a projectId as a parameter
// Returns a detailed object containing project information, members, tasks, and recent commits

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getServerSession();

  if (!data?.user || !data.user.name) {
    console.log("User is not authenticated");
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Please log in",
        data: null,
      }),
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      username: data.user.name,
    },
  });

  if (!user) {
    await signOut();
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Login required",
        data: null,
      }),
      { status: 400 }
    );
  }

  if (!id) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Project ID is required",
        data: null,
      }),
      { status: 400 }
    );
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        ProjectId: id,
        memberships: {
          some: {
            user: {
              username: data.user.name,
            },
          },
        },
      },
      select: {
        ProjectId: true,
        name: true,
        description: true,
        ownerId: true,
        memberships: {
          select: {
            role: true,
            user: {
              select: {
                UserId: true,
                username: true,
              },
            },
          },
        },
        commits: {
          orderBy: {
            timestamp: "desc",
          },
          take: 10,
          select: {
            id: true,
            message: true,
            author: true,
            branch: true,
            timestamp: true,
          },
        },
        task: {
          select: {
            TaskId: true,
            title: true,
            status: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            priority: true,
            assignee: {
              select: {
                UserId: true,
                username: true,
              },
            },
            creator: {
              select: {
                UserId: true,
                username: true,
              },
            },
          },
        },
        githubRepo: {
          select: {
            repoUrl: true,
          },
        },
      },
    });

    if (!projects || projects.length === 0) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Project not found or you're not part of the project",
          data: null,
        }),
        { status: 404 }
      );
    }

    // Transform the data to a more structured format
    const formattedProjects = projects.map((project) => ({
      projectInfo: {
        projectId: project.ProjectId,
        name: project.name,
        description: project.description || null,
        repoUrl: project.githubRepo?.repoUrl,
        ownerId: project.ownerId,
      },
      members: project.memberships.map((member) => ({
        userId: member.user.UserId,
        username: member.user.username,
        role: member.role,
      })),
      activeTasks: project.task.map((task) => ({
        TaskId: task.TaskId,
        title: task.title,
        status: task.status,
        description: task.description,
        priority: task.priority,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        assignee: task.assignee
          ? {
              UserId: task.assignee.UserId,
              username: task.assignee.username,
            }
          : null,
        creator: {
          id: task.creator.UserId,
          username: task.creator.username,
        },
      })),
      recentCommits: project.commits.map((commit) => ({
        id: commit.id,
        message: commit.message,
        author: commit.author,
        branch: commit.branch,
        timestamp: commit.timestamp,
      })),
    }));

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Project details fetched successfully",
        data: formattedProjects,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to fetch details for the project",
        data: null,
      }),
      { status: 500 }
    );
  }
}
