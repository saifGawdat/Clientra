import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ActivityTypeIcon } from "@/components/activities/activity-type-icon"
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
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

  // Optimized KPI fetching using aggregations instead of full findMany
  const [pipelineAgg, wonAgg, totalContacts, totalCompanies, completedActivitiesCount] = await Promise.all([
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
    prisma.company.count({ where: { ownerId: userId } }),
    prisma.activity.count({ where: { userId, status: "COMPLETED" } }),
  ])

  // Fetch only what's needed for the feed
  const [upcomingActivities, recentInvoices, recentActivities, openDeals] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, status: "PLANNED", scheduledAt: { not: null } },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { ownerId: userId },
      include: {
        contact: { select: { firstName: true, lastName: true } },
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
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
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, <span className="text-foreground">{userName}</span>
          </h1>
          <p className="text-subtle text-sm">Here&apos;s what&apos;s happening with your pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pipeline Value", value: formatCurrency(pipelineAgg._sum.value || 0), sub: `${pipelineAgg._count.id} open deals` },
          { label: "Won Revenue", value: formatCurrency(wonAgg._sum.value || 0), sub: `${wonAgg._count.id} deals closed` },
          { label: "Contacts", value: totalContacts.toString(), sub: `${totalCompanies} companies` },
          { label: "Activities Done", value: completedActivitiesCount.toString(), sub: "completed" },
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
              {openDeals.map((deal) => (
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
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">Recent Invoices</p>
          <Link href="/invoices" className="text-xs text-accent hover:text-accent-light">View all →</Link>
        </div>
        {recentInvoices.length === 0 ? (
          <p className="text-subtle text-sm py-4 text-center">No invoices yet</p>
        ) : (
          <div className="space-y-1">
            {recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0 hover:bg-surface/40 -mx-1 px-1 rounded transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground font-mono font-medium">{inv.invoiceNumber}</p>
                  <p className="text-xs text-subtle truncate">
                    {inv.contact
                      ? `${inv.contact.firstName} ${inv.contact.lastName}`
                      : inv.company?.name ?? "No client"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <InvoiceStatusBadge status={inv.status} />
                  <p className="text-xs font-mono font-bold text-emerald-400">${inv.amount.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
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
