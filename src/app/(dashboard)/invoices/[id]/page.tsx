import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { InvoiceDetail } from "@/components/invoices/invoice-detail"

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return null

  const { id } = await params

  const [invoice, contacts, companies, deals] = await Promise.all([
    prisma.invoice.findFirst({
      where: { id, ownerId: session.user.id },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        items: true,
      },
    }),
    prisma.contact.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, firstName: true, lastName: true, companyId: true },
    }),
    prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
    }),
    prisma.deal.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, title: true, value: true, currency: true, contactId: true, companyId: true },
    }),
  ])

  if (!invoice) notFound()

  return (
    <InvoiceDetail 
      invoice={invoice}
      contacts={contacts} 
      companies={companies} 
      deals={deals} 
    />
  )
}
