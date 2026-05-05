import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { dealSchema } from "@/lib/validations"
import { DealStage } from "@/types/crm-types"
import { getPaginationParams, getPaginatedResponse } from "@/lib/pagination"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const pagination = getPaginationParams(req)
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get("stage") ?? ""
  const search = searchParams.get("search") ?? ""

  const where = {
    ownerId: session.user.id,
    ...(stage && { stage: stage as DealStage }),
    ...(search && { title: { contains: search, mode: "insensitive" as const } }),
  }

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.deal.count({ where }),
  ])

  return NextResponse.json(getPaginatedResponse(deals, total, pagination))
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
