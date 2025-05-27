import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function checkProjectOwnership(userId: string, projectId: string) {
  try {
    const membership = await prisma.memberships.findFirst({
      where: {
        projectId: projectId,
        userId: userId,
        role: "OWNER",
      },
    });

    return membership !== null;
  } catch (error) {
    console.error("Error checking project ownership:", error);
    return false;
  }
}

export function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized: Only project owners can perform this action" },
    { status: 403 }
  );
}
