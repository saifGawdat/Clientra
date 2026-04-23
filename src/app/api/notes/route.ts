import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { noteSchema } from "@/lib/validations"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = noteSchema.parse(body)

    const note = await prisma.note.create({
      data: {
        content: data.content,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
        companyId: data.companyId || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}
