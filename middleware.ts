// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { checkProjectOwnership } from "./lib/middleware/checkProjectOwnership";

// // Define the shape of our expected request body
// interface DeleteProjectRequest {
//   UserId: string;
// }

// export async function middleware(request: NextRequest) {
//   try {
//     // Step 1: Extract the projectId from the URL
//     // URL pattern: /api/projects/[projectId]/delete-project
//     const projectId = request.nextUrl.pathname.split("/")[3];

//     // Step 2: Since it's a DELETE request, we need to clone and parse the request body
//     // We clone because the request body can only be read once
//     const body = (await request.clone().json()) as DeleteProjectRequest;
//     const userId = body.UserId;

//     // Step 3: Validate that we have the required userId
//     if (!userId) {
//       return NextResponse.json(
//         { error: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     // Step 4: Check if the user is the project owner using our utility function
//     const isOwner = await checkProjectOwnership(userId, projectId);

//     // Step 5: If not the owner, return unauthorized response
//     if (!isOwner) {
//       return NextResponse.json(
//         { error: "Unauthorized: Only project owners can delete projects" },
//         { status: 403 }
//       );
//     }

//     // Step 6: If all checks pass, allow the request to proceed
//     return NextResponse.next();
//   } catch (error) {
//     // Step 7: Handle any errors that occur during middleware execution
//     console.error("Middleware error:", error);
//     return NextResponse.json(
//       { error: "Internal server error in middleware" },
//       { status: 500 }
//     );
//   }
// }

// // Configure which routes this middleware should run on
// export const config = {
//   matcher: "/api/projects/:projectId/delete-project",
// };
