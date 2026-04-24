import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TargetsClient } from "@/components/targets/targets-client"

export default async function TargetsPage() {
  const session = await auth()
  if (!session?.user) return null

  const [targets, companies] = await Promise.all([
    prisma.contact.findMany({
      where: { ownerId: session!.user.id, status: "TARGET" },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return <TargetsClient initialTargets={targets} companies={companies} />
}
