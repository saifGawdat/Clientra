import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=google_denied", request.url))
  }

  try {
    const redirectUri = `${process.env.APP_URL || "http://localhost:3000"}/api/auth/google/callback`

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/login?error=google_token", request.url))
    }

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const googleUser = await userInfoRes.json()
    if (!userInfoRes.ok || !googleUser.email) {
      return NextResponse.redirect(new URL("/login?error=google_userinfo", request.url))
    }

    let user = await prisma.user.findUnique({ where: { email: googleUser.email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: googleUser.name || googleUser.email,
          email: googleUser.email,
          image: googleUser.picture || null,
        },
      })
    } else if (!user.image && googleUser.picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image: googleUser.picture },
      })
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    const session = await encrypt({ user: sessionUser, expires })

    const cookieStore = await cookies()
    cookieStore.set("session", session, { expires, httpOnly: true, path: "/" })

    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (err) {
    console.error("Google OAuth error:", err)
    return NextResponse.redirect(new URL("/login?error=google_failed", request.url))
  }
}
