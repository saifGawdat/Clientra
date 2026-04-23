import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { LeadsClient } from "@/components/leads/leads-client"

export default async function LeadsPage() {
  const session = await auth()

  const [leads, companies] = await Promise.all([
    prisma.contact.findMany({
      where: { ownerId: session!.user.id, status: { in: ["LEAD", "PROSPECT"] } },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.company.findMany({
      where: { ownerId: session!.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return <LeadsClient initialLeads={leads} companies={companies} />
}
