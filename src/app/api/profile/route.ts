import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const updates: { name?: string; password?: string } = {}

    if (data.name) {
      updates.name = data.name
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 })
      }
      if (!user.password) {
        return NextResponse.json({ error: "Cannot change password for OAuth accounts" }, { status: 400 })
      }
      const valid = await bcrypt.compare(data.currentPassword, user.password)
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
      updates.password = await bcrypt.hash(data.newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}
