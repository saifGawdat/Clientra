import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { activitySchema } from "@/lib/validations"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") ?? ""
  const status = searchParams.get("status") ?? ""
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")

  const where = {
    userId: session.user.id,
    ...(type && { type: type as "CALL" | "EMAIL" | "MEETING" | "TASK" | "NOTE" }),
    ...(status && { status: status as "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }),
  }

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activity.count({ where }),
  ])

  return NextResponse.json({ activities, total, page, limit })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = activitySchema.parse(body)

    const activity = await prisma.activity.create({
      data: {
        ...data,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        userId: session.user.id,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}
