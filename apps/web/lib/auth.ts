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
          const { data, error, response } = await apiClient.POST("/auth/login", {
            body: {
              email: credentials?.email ?? "",
              password: credentials?.password ?? "",
            },
          });

          if (response.status === 403) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          if (error || !data) {
            console.error("[NextAuth] Login API error:", error);
            return null;
          }
          // JWT payload からデコードして id/email を取得
          const payload = JSON.parse(
            Buffer.from(data.accessToken.split(".")[1]!, "base64").toString()
          );
          return {
            id: String(payload.sub),
            email: payload.email,
            accessToken: data.accessToken,
          };
        } catch (error) {
          if (error instanceof Error && error.message === "EMAIL_NOT_VERIFIED") {
            throw error;
          }
          console.error("[NextAuth] authorize() exception:", error);
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
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
