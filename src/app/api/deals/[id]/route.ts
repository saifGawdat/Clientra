import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { dealSchema } from "@/lib/validations"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const deal = await prisma.deal.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      contact: true,
      company: true,
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
      notes: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(deal)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const data = dealSchema.partial().parse(body)

    // Construct update data carefully to avoid overwriting with null
    const updateData: Record<string, unknown> = { ...data }
    if ("contactId" in body) updateData.contactId = body.contactId || null
    if ("companyId" in body) updateData.companyId = body.companyId || null
    if ("closeDate" in body) updateData.closeDate = body.closeDate ? new Date(body.closeDate) : null

    const result = await prisma.deal.updateMany({
      where: { id, ownerId: session.user.id },
      data: updateData,
    })

    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const updated = await prisma.deal.findUnique({
      where: { id },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
      },
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
  const result = await prisma.deal.deleteMany({ where: { id, ownerId: session.user.id } })
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
