import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InvoicesClient } from "@/components/invoices/invoices-client"

export default async function InvoicesPage() {
  const session = await auth()
  if (!session?.user) return null

  const userId = session.user.id

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
  const safeInvoices = JSON.parse(JSON.stringify(invoices));
  const safeContacts = JSON.parse(JSON.stringify(contacts));
  const safeCompanies = JSON.parse(JSON.stringify(companies));
  const safeDeals = JSON.parse(JSON.stringify(deals));

  return (
    <InvoicesClient 
      initialInvoices={safeInvoices} 
      contacts={safeContacts} 
      companies={safeCompanies} 
      deals={safeDeals}
    />
  )
}
