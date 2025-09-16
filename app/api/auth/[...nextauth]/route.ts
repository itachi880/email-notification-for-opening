import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prismaClient } from "@/lib/prisma-client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: [
    CredentialsProvider({
      name: "Gmail",
      credentials: {
        email: { label: "Gmail Address", type: "email" },
        password: { label: "App Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Test Gmail connection with provided credentials
        const testTransporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: credentials.email,
            pass: credentials.password,
          },
        });

        try {
          // Verify the connection
          await testTransporter.verify();

          // Check if user exists in database
          let user = await prismaClient.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            // Create new user with app password (stored as-is for IMAP)
            user = await prismaClient.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split("@")[0],
                gmailPassword: credentials.password, // Store app password as-is
              },
            });
          } else {
            // Update existing user's password
            user = await prismaClient.user.update({
              where: { id: user.id },
              data: { gmailPassword: credentials.password }, // Store app password as-is
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Gmail authentication failed:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
