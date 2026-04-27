import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ActivityTypeIcon } from "@/components/activities/activity-type-icon"
import Link from "next/link"

const statusColors: Record<string, string> = {
  PLANNED: "text-blue-400",
  IN_PROGRESS: "text-amber-400",
  COMPLETED: "text-emerald-400",
  CANCELLED: "text-red-400",
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const userId = session.user.id
  const userName = session.user.name ?? "there"

  const [deals, activities, totalContacts, totalCompanies] = await Promise.all([
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
    prisma.company.count({ where: { ownerId: userId } }),
  ])

  const openDeals = deals.filter((d) => !(["WON", "LOST"] as string[]).includes(d.stage))
  const wonDeals = deals.filter((d) => d.stage === "WON")
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)
  const wonRevenue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)
  const completedActivities = activities.filter((a) => a.status === "COMPLETED").length

  const upcomingActivities = activities
    .filter((a) => a.status === "PLANNED" && a.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 5)

  const recentActivities = activities.slice(0, 8)

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 sm:space-y-5 min-h-full">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-border">
          <AvatarImage src={session.user.image ?? ""} />
          <AvatarFallback className="bg-accent/20 text-accent font-bold text-sm">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">
            Welcome back, {userName}
          </h1>
          <p className="text-subtle text-sm">Here&apos;s what&apos;s happening with your pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pipeline Value", value: formatCurrency(pipelineValue), sub: `${openDeals.length} open deals` },
          { label: "Won Revenue", value: formatCurrency(wonRevenue), sub: `${wonDeals.length} deals closed` },
          { label: "Contacts", value: totalContacts.toString(), sub: `${totalCompanies} companies` },
          { label: "Activities Done", value: completedActivities.toString(), sub: "completed" },
        ].map((kpi) => (
          <div key={kpi.label} className="gradient-card">
            <p className="text-subtle text-xs uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className="text-2xl font-bold font-mono text-foreground mb-1">{kpi.value}</p>
            <p className="text-xs text-subtle">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="oled-card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">Upcoming Activities</p>
            <Link href="/activities" className="text-xs text-accent hover:text-accent-light">View all →</Link>
          </div>
          {upcomingActivities.length === 0 ? (
            <p className="text-subtle text-sm py-4 text-center">No scheduled activities</p>
          ) : (
            <div className="space-y-1">
              {upcomingActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                  <ActivityTypeIcon type={a.type} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground font-medium truncate">{a.subject}</p>
                    {a.contact && (
                      <p className="text-xs text-subtle">{a.contact.firstName} {a.contact.lastName}</p>
                    )}
                  </div>
                  <p className="text-xs text-subtle shrink-0">{a.scheduledAt ? formatDate(a.scheduledAt) : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="oled-card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">Open Deals</p>
            <Link href="/opportunities" className="text-xs text-accent hover:text-accent-light">View all →</Link>
          </div>
          {openDeals.length === 0 ? (
            <p className="text-subtle text-sm py-4 text-center">No open deals</p>
          ) : (
            <div className="space-y-1">
              {openDeals.slice(0, 6).map((deal) => (
                <div key={deal.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <Link href={`/deals/${deal.id}`} className="text-sm text-foreground font-medium truncate hover:text-accent transition-colors block">
                      {deal.title}
                    </Link>
                    {deal.company && <p className="text-xs text-subtle">{deal.company.name}</p>}
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
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">Activity Feed</p>
          <Link href="/activities" className="text-xs text-accent hover:text-accent-light">View all →</Link>
        </div>
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
                      <span className="text-xs text-subtle">{a.contact.firstName} {a.contact.lastName}</span>
                    )}
                    {a.deal && <span className="text-xs text-subtle">· {a.deal.title}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-medium ${statusColors[a.status] ?? "text-subtle"}`}>{a.status}</span>
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
