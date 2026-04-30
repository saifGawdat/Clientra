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
    // Run individually to isolate which query fails in production
    const invoices = await prisma.invoice.findMany({
      where: { ownerId: userId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    }).catch((e: Error) => { throw new Error("invoices: " + e.message) })

    const contacts = await prisma.contact.findMany({
      where: { ownerId: userId },
      select: { id: true, firstName: true, lastName: true, companyId: true },
      orderBy: { firstName: "asc" },
    }).catch((e: Error) => { throw new Error("contacts: " + e.message) })

    const companies = await prisma.company.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }).catch((e: Error) => { throw new Error("companies: " + e.message) })

    const deals = await prisma.deal.findMany({
      where: { ownerId: userId },
      select: { id: true, title: true, value: true, currency: true, contactId: true, companyId: true },
      orderBy: { title: "asc" },
    }).catch((e: Error) => { throw new Error("deals: " + e.message) })

    return NextResponse.json({ invoices, contacts, companies, deals })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Invoices Data API Error:", message)
    return NextResponse.json({ 
      error: "Failed to fetch data",
      details: message
    }, { status: 500 })
  }
}
