import { NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validations"
import { encrypt } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
    const session = await encrypt({ user: sessionUser, expires })

    // Save session in cookie
    const cookieStore = await cookies()
    cookieStore.set("session", session, { expires, httpOnly: true, path: "/" })

    return NextResponse.json(sessionUser)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
