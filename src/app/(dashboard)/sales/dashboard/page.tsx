import dynamic from "next/dynamic"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActivityTypeIcon } from "@/components/activities/activity-type-icon"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

const DashboardChart = dynamic(
  () => import("@/components/dashboard/dashboard-chart").then((m) => m.DashboardChart),
  {
    loading: () => (
      <div className="h-64 rounded-xl border border-border bg-surface/30 animate-pulse" aria-hidden />
    ),
  },
)

const STAGE_ORDER = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const

export default async function SalesDashboardPage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = session.user.id

  const [dealStats, recentDeals, recentActivities] = await Promise.all([
    prisma.deal.groupBy({
      by: ['stage'],
      where: { ownerId: userId },
      _count: { id: true },
      _sum: { value: true },
    }),
    prisma.deal.findMany({
      where: { ownerId: userId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
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
  ])

  let openDealsCount = 0
  let pipelineValue = 0
  let wonDealsCount = 0
  let wonRevenue = 0
  let lostDealsCount = 0

  const chartDataMap: Record<string, { count: number; value: number }> = {}

  for (const stat of dealStats) {
    const count = stat._count.id
    const value = stat._sum.value ?? 0

    chartDataMap[stat.stage] = { count, value }

    if (stat.stage === "WON") {
      wonDealsCount += count
      wonRevenue += value
    } else if (stat.stage === "LOST") {
      lostDealsCount += count
    } else {
      openDealsCount += count
      pipelineValue += value
    }
  }

  const closedCount = wonDealsCount + lostDealsCount
  const winRate = closedCount > 0 ? Math.round((wonDealsCount / closedCount) * 100) : 0
  const avgDealSize = openDealsCount > 0 ? pipelineValue / openDealsCount : 0

  const chartData = STAGE_ORDER.map((stage) => ({
    stage,
    count: chartDataMap[stage]?.count ?? 0,
    value: chartDataMap[stage]?.value ?? 0,
  }))

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 sm:space-y-5 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Sales Dashboard</h1>
        <p className="text-subtle text-sm mt-1">Your full sales pipeline at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pipeline Value", value: formatCurrency(pipelineValue), sub: `${openDealsCount} open deals` },
          { label: "Won Revenue", value: formatCurrency(wonRevenue), sub: `${wonDealsCount} deals won` },
          { label: "Win Rate", value: `${winRate}%`, sub: `${closedCount} deals closed` },
          { label: "Avg Deal Size", value: formatCurrency(avgDealSize), sub: "open pipeline" },
        ].map((kpi) => (
          <div key={kpi.label} className="oled-card">
            <p className="text-subtle text-xs uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className="text-2xl font-bold font-mono text-foreground mb-1">{kpi.value}</p>
            <p className="text-xs text-subtle">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 oled-card space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">Pipeline by Stage</p>
          <DashboardChart data={chartData} />
        </div>

        <div className="oled-card space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">Recent Activity</p>
          {recentActivities.length === 0 ? (
            <p className="text-subtle text-sm py-4 text-center">No activities yet</p>
          ) : (
            <div className="space-y-2">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
                  <ActivityTypeIcon type={a.type} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{a.subject}</p>
                    <p className="text-xs text-subtle mt-0.5">{formatDate(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="oled-card space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">Recent Deals</p>
          <Link href="/deals" className="text-xs text-accent hover:text-accent-light transition-colors">
            View all →
          </Link>
        </div>
        {recentDeals.length === 0 ? (
          <p className="text-subtle text-sm py-4 text-center">No deals yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 font-medium text-subtle text-xs uppercase tracking-wider">Deal</th>
                  <th className="text-left pb-2 font-medium text-subtle text-xs uppercase tracking-wider">Stage</th>
                  <th className="text-left pb-2 font-medium text-subtle text-xs uppercase tracking-wider">Value</th>
                  <th className="text-left pb-2 font-medium text-subtle text-xs uppercase tracking-wider">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal) => (
                  <tr key={deal.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4">
                      <Link href={`/deals/${deal.id}`} className="text-foreground hover:text-accent transition-colors font-medium">
                        {deal.title}
                      </Link>
                      {deal.company && (
                        <p className="text-xs text-subtle">{deal.company.name}</p>
                      )}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs text-muted">{deal.stage}</span>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-foreground text-xs">
                      {deal.value != null ? formatCurrency(deal.value, deal.currency) : "—"}
                    </td>
                    <td className="py-2.5 text-subtle text-xs">{formatDate(deal.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
