import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DealsClient } from "@/components/deals/deals-client"

export default async function DealsPage() {
  const session = await auth()
  if (!session?.user) return null

  const [deals, contacts, companies] = await Promise.all([
    prisma.deal.findMany({
      where: { ownerId: session.user.id },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.contact.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, firstName: true, lastName: true, companyId: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.company.findMany({
      where: { ownerId: session!.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return <DealsClient initialDeals={deals} contacts={contacts} companies={companies} />
}
