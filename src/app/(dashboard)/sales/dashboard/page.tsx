import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { ActivityTypeIcon } from "@/components/activities/activity-type-icon"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

const STAGE_ORDER = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const

export default async function SalesDashboardPage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = session.user.id

  const [deals, recentActivities] = await Promise.all([
    prisma.deal.findMany({
      where: { ownerId: userId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
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

  const wonDeals = deals.filter((d) => d.stage === "WON")
  const lostDeals = deals.filter((d) => d.stage === "LOST")
  const openDeals = deals.filter((d) => !(["WON", "LOST"] as string[]).includes(d.stage))

  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)
  const wonRevenue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)
  const closedCount = wonDeals.length + lostDeals.length
  const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0
  const avgDealSize = openDeals.length > 0
    ? openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0) / openDeals.length
    : 0

  const chartData = STAGE_ORDER.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage)
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    }
  })

  const recentDeals = deals.slice(0, 6)

  return (
    <div className="p-8 space-y-8 bg-background min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Sales Dashboard</h1>
        <p className="text-subtle text-sm mt-1">Your full sales pipeline at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pipeline Value", value: formatCurrency(pipelineValue), sub: `${openDeals.length} open deals` },
          { label: "Won Revenue", value: formatCurrency(wonRevenue), sub: `${wonDeals.length} deals won` },
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
