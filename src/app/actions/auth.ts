"use server"

import { signIn, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=invalid")
    }
    throw error
  }
}

export async function handleRegister(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password || password.length < 6) {
    redirect("/register?error=invalid")
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    redirect("/register?error=exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  await db.user.create({
    data: { name, email, password: hashedPassword },
  })

  redirect("/login?registered=true")
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" })
}
