import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""

  if (!q || q.length < 2) {
    return NextResponse.json({
      contacts: [],
      companies: [],
      deals: [],
      invoices: [],
    })
  }

  try {
    const [contacts, companies, deals, invoices] = await Promise.all([
      prisma.contact.findMany({
        where: {
          ownerId: session.user.id,
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
      prisma.company.findMany({
        where: {
          ownerId: session.user.id,
          name: { contains: q, mode: "insensitive" },
        },
        take: 5,
        select: { id: true, name: true },
      }),
      prisma.deal.findMany({
        where: {
          ownerId: session.user.id,
          title: { contains: q, mode: "insensitive" },
        },
        take: 5,
        select: { id: true, title: true, value: true },
      }),
      prisma.invoice.findMany({
        where: {
          ownerId: session.user.id,
          invoiceNumber: { contains: q, mode: "insensitive" },
        },
        take: 5,
        select: { id: true, invoiceNumber: true, amount: true },
      }),
    ])

    return NextResponse.json({
      contacts,
      companies,
      deals,
      invoices,
    })
  } catch (error) {
    console.error("Global search error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
