import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { contactSchema } from "@/lib/validations"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const contact = await prisma.contact.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      company: true,
      deals: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
      notes: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(contact)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const data = contactSchema.partial().parse(body)

    const contact = await prisma.contact.updateMany({
      where: { id, ownerId: session.user.id },
      data: {
        ...data,
        email: data.email || null,
        companyId: data.companyId || null,
      },
    })

    if (contact.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await prisma.contact.findUnique({
      where: { id },
      include: { company: { select: { id: true, name: true } } },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const result = await prisma.contact.deleteMany({ where: { id, ownerId: session.user.id } })
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
