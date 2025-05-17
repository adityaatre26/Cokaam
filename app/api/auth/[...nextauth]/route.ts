import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  callbacks: {
    async signIn({ user }) {
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
  },
  secret: process.env.NEXTAUTH_SECRET || "",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
