import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { db } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? "alanis-med-secret-key-2025",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({ where: { email: credentials.email as string } })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Auto-criar usuário no DB ao logar com Google
      if (account?.provider === "google" && user.email) {
        const existing = await db.user.findUnique({ where: { email: user.email } })
        if (!existing) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name ?? user.email.split("@")[0],
              image: user.image ?? null,
              role: "ALUNO",
            },
          })
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      if (token.role) session.user.role = token.role as string
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "ALUNO"
        // Buscar role do DB se login por Google
        if (!token.role || token.role === "ALUNO") {
          const dbUser = await db.user.findUnique({ where: { email: token.email ?? "" } })
          if (dbUser) token.role = dbUser.role
        }
      }
      return token
    },
  },
  pages: { signIn: "/login" },
})
