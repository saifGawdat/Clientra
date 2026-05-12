import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPaginationParams, getPaginatedResponse } from "@/lib/pagination"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const pagination = getPaginationParams(req)

  try {
    const [invoices, totalInvoices, contacts, companies, deals] = await Promise.all([
      prisma.invoice.findMany({
        where: { ownerId: userId },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.invoice.count({ where: { ownerId: userId } }),
      prisma.contact.findMany({
        where: { ownerId: userId },
        select: { id: true, firstName: true, lastName: true, companyId: true },
        orderBy: { firstName: "asc" },
        take: 100, // Limit secondary data
      }),
      prisma.company.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
        take: 100,
      }),
      prisma.deal.findMany({
        where: { ownerId: userId },
        select: { id: true, title: true, value: true, currency: true, contactId: true, companyId: true },
        orderBy: { title: "asc" },
        take: 100,
      }),
    ])

    return NextResponse.json({
      ...getPaginatedResponse(invoices, totalInvoices, pagination),
      contacts,
      companies,
      deals,
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Invoices Data API Error:", message)
    return NextResponse.json({ 
      error: "Failed to fetch data",
      details: message
    }, { status: 500 })
  }
}
