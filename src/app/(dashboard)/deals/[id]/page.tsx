import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { DealDetail } from "@/components/deals/deal-detail"

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return null
  const { id } = await params

  const [deal, contacts, companies] = await Promise.all([
    prisma.deal.findFirst({
      where: { id, ownerId: session!.user.id },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
        notes: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.contact.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.company.findMany({
      where: { ownerId: session!.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!deal) notFound()

  return <DealDetail deal={deal} contacts={contacts} companies={companies} />
}
