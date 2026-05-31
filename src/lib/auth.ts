import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { cache } from "react"

const secretKey = process.env.AUTH_SECRET || "default-secret-key-change-me"
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return payload
}

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

// React.cache() deduplicates this per-request: if layout + page both call auth(),
// JWT decryption only runs once instead of twice per navigation.
export const getSession = cache(async (): Promise<{ user: SessionUser } | null> => {
  try {
    const session = (await cookies()).get("session")?.value
    if (!session) return null
    const payload = await decrypt(session)
    return payload as unknown as { user: SessionUser }
  } catch {
    return null
  }
})

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  if (!session) return

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session)
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const res = NextResponse.next()
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires as Date,
  })
  return res
}

export const auth = getSession

