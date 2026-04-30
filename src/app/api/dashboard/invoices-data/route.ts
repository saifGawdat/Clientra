import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const [invoices, contacts, companies, deals] = await Promise.all([
      prisma.invoice.findMany({
        where: { ownerId: userId },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.findMany({
        where: { ownerId: userId },
        select: { id: true, firstName: true, lastName: true, companyId: true },
        orderBy: { firstName: "asc" },
      }),
      prisma.company.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.deal.findMany({
        where: { ownerId: userId },
        select: { id: true, title: true, value: true, currency: true, contactId: true, companyId: true },
        orderBy: { title: "asc" },
      }),
    ])

    return NextResponse.json({
      invoices,
      contacts,
      companies,
      deals
    })
  } catch (error) {
    console.error("Invoices Data API Error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
