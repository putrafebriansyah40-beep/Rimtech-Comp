import NextAuth, { type DefaultSession, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

class DatabaseUnavailableError extends CredentialsSignin {
  code = "database_unavailable";
}

// Autentikasi admin/teknisi menggunakan Auth.js (NextAuth v5)
// - Password diverifikasi dengan Bcrypt (NFR 4.2)
// - Sesi berupa JWT terenkripsi di HTTP-Only cookie

declare module "next-auth" {
  interface Session {
    user: { id: string; role: string; username: string } & DefaultSession["user"];
  }
  interface User {
    role?: string;
    username?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 jam
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Akun Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { username: parsed.data.username },
          });
          if (!user) return null;

          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid) return null;

          return {
            id: String(user.id),
            name: user.name,
            role: user.role,
            username: user.username,
          };
        } catch (error) {
          if (
            error instanceof Error &&
            (error.message.includes("Can't reach database") ||
              error.message.includes("P1001") ||
              error.name === "PrismaClientInitializationError")
          ) {
            throw new DatabaseUnavailableError();
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role ?? "ADMIN";
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.uid ?? "");
      session.user.role = String(token.role ?? "ADMIN");
      session.user.username = String(token.username ?? "");
      return session;
    },
  },
});
