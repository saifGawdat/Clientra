import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ActivityTypeIcon } from "@/components/activities/activity-type-icon"

const statusColors: Record<string, string> = {
  PLANNED: "text-blue-400",
  IN_PROGRESS: "text-amber-400",
  COMPLETED: "text-emerald-400",
  CANCELLED: "text-red-400",
}

export default async function MyDashboardPage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = session.user.id
  const userName = session.user.name ?? "You"

  // Parallelize and optimize queries (use aggregations instead of JS filtering)
  const [
    openDealsAgg,
    wonDealsAgg,
    contactsCount,
    completedActivitiesCount,
    upcomingActivities,
    recentActivities,
    openDealsList,
  ] = await Promise.all([
    prisma.deal.aggregate({
      where: { ownerId: userId, stage: { notIn: ["WON", "LOST"] } },
      _sum: { value: true },
      _count: { id: true },
    }),
    prisma.deal.aggregate({
      where: { ownerId: userId, stage: "WON" },
      _sum: { value: true },
      _count: { id: true },
    }),
    prisma.contact.count({ where: { ownerId: userId } }),
    prisma.activity.count({ where: { userId, status: "COMPLETED" } }),
    prisma.activity.findMany({
      where: { userId, status: "PLANNED", scheduledAt: { not: null } },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.activity.findMany({
      where: { userId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.deal.findMany({
      where: { ownerId: userId, stage: { notIn: ["WON", "LOST"] } },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ])

  const pipelineValue = openDealsAgg._sum.value ?? 0
  const wonRevenue = wonDealsAgg._sum.value ?? 0
  const openDealsCount = openDealsAgg._count.id
  const wonDealsCount = wonDealsAgg._count.id

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 sm:space-y-5 min-h-full">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-border">
          <AvatarImage src={session.user.image ?? ""} />
          <AvatarFallback className="bg-accent/20 text-accent font-bold">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Dashboard</h1>
          <p className="text-subtle text-sm">Welcome back, {userName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Pipeline", value: formatCurrency(pipelineValue), sub: `${openDealsCount} open deals` },
          { label: "Won Revenue", value: formatCurrency(wonRevenue), sub: `${wonDealsCount} deals closed` },
          { label: "My Contacts", value: contactsCount.toString(), sub: "total contacts owned" },
          { label: "Activities Done", value: completedActivitiesCount.toString(), sub: "completed activities" },
        ].map((kpi) => (
          <div key={kpi.label} className="oled-card">
            <p className="text-subtle text-xs uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className="text-2xl font-bold font-mono text-foreground mb-1">{kpi.value}</p>
            <p className="text-xs text-subtle">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="oled-card space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">Upcoming Activities</p>
          {upcomingActivities.length === 0 ? (
            <p className="text-subtle text-sm py-4 text-center">No scheduled activities</p>
          ) : (
            <div className="space-y-2">
              {upcomingActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                  <ActivityTypeIcon type={a.type} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground font-medium truncate">{a.subject}</p>
                    {a.contact && (
                      <p className="text-xs text-subtle">
                        {a.contact.firstName} {a.contact.lastName}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-subtle shrink-0">
                    {a.scheduledAt ? formatDate(a.scheduledAt) : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="oled-card space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">My Open Deals</p>
          {openDealsList.length === 0 ? (
            <p className="text-subtle text-sm py-4 text-center">No open deals</p>
          ) : (
            <div className="space-y-2">
              {openDealsList.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">{deal.title}</p>
                    {deal.company && (
                      <p className="text-xs text-subtle">{deal.company.name}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs font-mono text-accent">
                      {deal.value != null ? formatCurrency(deal.value, deal.currency) : "—"}
                    </p>
                    <p className="text-xs text-subtle">{deal.stage}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="oled-card space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-subtle">Activity Feed</p>
        {recentActivities.length === 0 ? (
          <p className="text-subtle text-sm py-4 text-center">No activities yet</p>
        ) : (
          <div className="space-y-1">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                <ActivityTypeIcon type={a.type} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{a.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {a.contact && (
                      <span className="text-xs text-subtle">
                        {a.contact.firstName} {a.contact.lastName}
                      </span>
                    )}
                    {a.deal && (
                      <span className="text-xs text-subtle">· {a.deal.title}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-medium ${statusColors[a.status] ?? "text-subtle"}`}>
                    {a.status}
                  </span>
                  <p className="text-xs text-subtle">{formatDate(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
