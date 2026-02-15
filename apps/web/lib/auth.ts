import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "@/lib/api-client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { data, error } = await apiClient.POST("/users/validate", {
            body: {
              email: credentials?.email ?? "",
              password: credentials?.password ?? "",
            },
          });
          if (error || !data) {
            return null;
          }
          return { id: String(data.id), email: data.email };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },
};
