import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invoiceSchema } from "@/lib/validations"

type Status = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") ?? ""
  const status = searchParams.get("status") ?? ""
  const contactId = searchParams.get("contactId") ?? ""
  const companyId = searchParams.get("companyId") ?? ""
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")

  const where = {
    ownerId: session.user.id,
    ...(contactId && { contactId }),
    ...(companyId && { companyId }),
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: "insensitive" as const } },
        { contact: { firstName: { contains: search, mode: "insensitive" as const } } },
        { contact: { lastName: { contains: search, mode: "insensitive" as const } } },
        { company: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
    ...(status && { status: status as Status }),
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ])

  return NextResponse.json({ invoices, total, page, limit })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { items, ...data } = invoiceSchema.parse(body)

    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: new Date(data.dueDate),
        contactId: data.contactId || null,
        companyId: data.companyId || null,
        dealId: data.dealId || null,
        ownerId: session.user.id,
        items: {
          create: items,
        },
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        items: true,
      },
    })

    // Auto-update deal to WON if invoice is PAID
    if (invoice.status === "PAID" && invoice.dealId) {
      await prisma.deal.update({
        where: { id: invoice.dealId },
        data: { stage: "WON" }
      })
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Invoice creation error:", error)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}
