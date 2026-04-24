import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActivitiesClient } from "@/components/activities/activities-client"

export default async function ActivitiesPage() {
  const session = await auth()
  if (!session?.user) return null

  const [activities, contacts, deals] = await Promise.all([
    prisma.activity.findMany({
      where: { userId: session.user.id },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.contact.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.deal.findMany({
      where: { ownerId: session!.user.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ])

  return <ActivitiesClient initialActivities={activities} contacts={contacts} deals={deals} />
}
