import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OpportunitiesClient } from "@/components/opportunities/opportunities-client"

export default async function OpportunitiesPage() {
  const session = await auth()

  const opportunities = await prisma.deal.findMany({
    where: {
      ownerId: session!.user.id,
      stage: { notIn: ["WON", "LOST"] },
    },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return <OpportunitiesClient initialOpportunities={opportunities} />
}
