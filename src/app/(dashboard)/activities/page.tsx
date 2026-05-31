import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActivitiesClient } from "@/components/activities/activities-client"

export default async function ActivitiesPage() {
  const session = await auth()
  if (!session?.user) return null

  // Only fetch the activities list — contacts+deals are fetched lazily from
  // the React Query cache when the form opens, not on every page navigation.
  const activities = await prisma.activity.findMany({
    where: { userId: session.user.id },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      deal: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return <ActivitiesClient initialActivities={activities} />
}
