import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activityTypeIcon: Record<string, string> = {
  CALL: "📞",
  EMAIL: "✉️",
  MEETING: "🤝",
  TASK: "✅",
  NOTE: "📝",
}

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

  const [deals, activities, contacts] = await Promise.all([
    prisma.deal.findMany({
      where: { ownerId: userId },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.activity.findMany({
      where: { userId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.contact.count({ where: { ownerId: userId } }),
  ])

  const openDeals = deals.filter((d) => !(["WON", "LOST"] as string[]).includes(d.stage))
  const wonDeals = deals.filter((d) => d.stage === "WON")
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)
  const wonRevenue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)

  const completedActivities = activities.filter((a) => a.status === "COMPLETED")
  const upcomingActivities = activities
    .filter((a) => a.status === "PLANNED" && a.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 5)

  const recentActivities = activities.slice(0, 8)

  return (
    <div className="p-8 space-y-8 bg-background min-h-full">
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
          { label: "My Pipeline", value: formatCurrency(pipelineValue), sub: `${openDeals.length} open deals` },
          { label: "Won Revenue", value: formatCurrency(wonRevenue), sub: `${wonDeals.length} deals closed` },
          { label: "My Contacts", value: contacts.toString(), sub: "total contacts owned" },
          { label: "Activities Done", value: completedActivities.length.toString(), sub: "completed activities" },
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
                  <span className="text-base leading-none mt-0.5">{activityTypeIcon[a.type] ?? "•"}</span>
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
          {openDeals.length === 0 ? (
            <p className="text-subtle text-sm py-4 text-center">No open deals</p>
          ) : (
            <div className="space-y-2">
              {openDeals.slice(0, 6).map((deal) => (
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
                <span className="text-base leading-none mt-0.5 shrink-0">{activityTypeIcon[a.type] ?? "•"}</span>
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
