import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { companySchema } from "@/lib/validations"
import { CompanySize } from "@/types/crm-types"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const company = await prisma.company.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      contacts: { take: 10, orderBy: { createdAt: "desc" } },
      deals: { take: 10, orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  })

  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(company)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const data = companySchema.partial().parse(body)

    const updateData: Record<string, unknown> = { ...data }
    if ("website" in body) updateData.website = body.website || null
    if ("email" in body) updateData.email = body.email || null
    if ("size" in body) updateData.size = (body.size as CompanySize) || null

    const result = await prisma.company.updateMany({
      where: { id, ownerId: session.user.id },
      data: updateData,
    })

    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const updated = await prisma.company.findUnique({ where: { id } })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const result = await prisma.company.deleteMany({ where: { id, ownerId: session.user.id } })
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
