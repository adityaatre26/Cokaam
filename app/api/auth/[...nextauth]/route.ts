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
          },
        });

        console.log("New user created:", user);
      }

      return true;
    },
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          githubUsername: user.name,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.accessToken = token.accessToken;
        session.user.githubUsername = token.githubUsername;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
