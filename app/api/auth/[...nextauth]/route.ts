import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const prisma = new PrismaClient();

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "repo user admin:repo_hook", // Needed for webhook creation
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: user.email || "",
        },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email || "",
            username: user.name || "",
            accessToken: account.access_token,
          },
        });

        console.log("New user created:", user);
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
