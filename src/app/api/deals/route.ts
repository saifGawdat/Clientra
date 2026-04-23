import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { dealSchema } from "@/lib/validations"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const stage = searchParams.get("stage") ?? ""
  const search = searchParams.get("search") ?? ""

  const where = {
    ownerId: session.user.id,
    ...(stage && { stage: stage as "LEAD" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST" }),
    ...(search && { title: { contains: search, mode: "insensitive" as const } }),
  }

  const deals = await prisma.deal.findMany({
    where,
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(deals)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = dealSchema.parse(body)

    const deal = await prisma.deal.create({
      data: {
        ...data,
        contactId: data.contactId || null,
        companyId: data.companyId || null,
        closeDate: data.closeDate ? new Date(data.closeDate) : null,
        ownerId: session.user.id,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}
