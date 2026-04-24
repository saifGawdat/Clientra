import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { companySchema } from "@/lib/validations"
import { CompanySize } from "@/types/crm-types"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") ?? ""
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")

  const where = {
    ownerId: session.user.id,
    ...(search && {
      name: { contains: search, mode: "insensitive" as const },
    }),
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: { _count: { select: { contacts: true, deals: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ])

  return NextResponse.json({ companies, total, page, limit })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = companySchema.parse(body)

    const { size, website, email, ...rest } = data
    const company = await prisma.company.create({
      data: {
        ...rest,
        website: website || null,
        email: email || null,
        size: (size as CompanySize) || null,
        ownerId: session.user.id,
      },
    })

    return NextResponse.json(company, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}
