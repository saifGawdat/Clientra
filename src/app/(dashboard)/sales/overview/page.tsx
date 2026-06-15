import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"

const STAGES = [
  { key: "LEAD", label: "Lead", color: "bg-border-hover" },
  { key: "QUALIFIED", label: "Qualified", color: "bg-blue-700" },
  { key: "PROPOSAL", label: "Proposal", color: "bg-amber-600" },
  { key: "NEGOTIATION", label: "Negotiation", color: "bg-accent" },
  { key: "WON", label: "Won", color: "bg-emerald-600" },
  { key: "LOST", label: "Lost", color: "bg-red-700" },
] as const

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL: "Social",
  EMAIL: "Email",
  COLD_CALL: "Cold Call",
  EVENT: "Event",
  OTHER: "Other",
}

export default async function SalesOverviewPage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = session.user.id

  const [dealStats, contactSourceStats, totalContacts, customerContacts] = await Promise.all([
    prisma.deal.groupBy({
      by: ['stage'],
      where: { ownerId: userId },
      _count: { id: true },
      _sum: { value: true },
    }),
    prisma.contact.groupBy({
      by: ['source'],
      where: { ownerId: userId },
      _count: { id: true },
    }),
    prisma.contact.count({ where: { ownerId: userId } }),
    prisma.contact.count({ where: { ownerId: userId, status: "CUSTOMER" } }),
  ])

  let totalDeals = 0
  let openPipelineValue = 0
  let wonDealsCount = 0
  let lostDealsCount = 0

  const stageMap: Record<string, { count: number; value: number }> = {}

  for (const stat of dealStats) {
    const count = stat._count.id
    const value = stat._sum.value ?? 0
    stageMap[stat.stage] = { count, value }
    totalDeals += count

    if (stat.stage === "WON") {
      wonDealsCount += count
    } else if (stat.stage === "LOST") {
      lostDealsCount += count
    } else {
      openPipelineValue += value
    }
  }

  const maxCount = Math.max(...STAGES.map((s) => stageMap[s.key]?.count ?? 0), 1)

  const stageStats = STAGES.map((stage) => {
    const count = stageMap[stage.key]?.count ?? 0
    const value = stageMap[stage.key]?.value ?? 0
    return {
      ...stage,
      count,
      value,
      pct: totalDeals > 0 ? Math.round((count / totalDeals) * 100) : 0,
      barPct: maxCount > 0 ? Math.round((count / maxCount) * 100) : 0,
    }
  })

  const closedCount = wonDealsCount + lostDealsCount
  const winRate = closedCount > 0 ? Math.round((wonDealsCount / closedCount) * 100) : 0
  const conversionRate = totalContacts > 0 ? Math.round((customerContacts / totalContacts) * 100) : 0

  const sourceBreakdown = contactSourceStats
    .map((stat) => [stat.source, stat._count.id] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const maxSourceCount = Math.max(...sourceBreakdown.map(([, count]) => count), 1)

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 sm:space-y-5 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Sales Overview</h1>
        <p className="text-subtle text-sm mt-1">Pipeline health and conversion analysis</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Deals", value: totalDeals.toString() },
          { label: "Open Pipeline", value: formatCurrency(openPipelineValue) },
          { label: "Win Rate", value: `${winRate}%` },
          { label: "Contact Conversion", value: `${conversionRate}%` },
        ].map((s) => (
          <div key={s.label} className="oled-card">
            <p className="text-subtle text-xs uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="oled-card space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">Pipeline Funnel</p>
          <div className="space-y-3">
            {stageStats.map((stage) => (
              <div key={stage.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted font-medium">{stage.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-subtle text-xs">{stage.pct}%</span>
                    <span className="font-mono text-foreground text-xs w-16 text-right">
                      {formatCurrency(stage.value)}
                    </span>
                    <span className="text-subtle text-xs w-12 text-right">{stage.count} deals</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${stage.color}`}
                    style={{ width: `${stage.barPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="oled-card space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-subtle">Contacts by Source</p>
          {sourceBreakdown.length === 0 ? (
            <p className="text-subtle text-sm py-4 text-center">No contacts yet</p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map(([source, count]) => (
                <div key={source} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">{SOURCE_LABELS[source] ?? source}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-subtle text-xs">
                        {totalContacts > 0 ? Math.round((count / totalContacts) * 100) : 0}%
                      </span>
                      <span className="text-foreground text-xs w-8 text-right">{count}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${Math.round((count / maxSourceCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="oled-card space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-subtle">Stage Breakdown</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Stage", "Deals", "Total Value", "Avg Value", "% of Pipeline"].map((h) => (
                  <th key={h} className="text-left pb-2 font-medium text-subtle text-xs uppercase tracking-wider pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stageStats.map((s) => (
                <tr key={s.key} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-6">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${s.color}`} />
                      <span className="text-foreground font-medium">{s.label}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-6 text-muted">{s.count}</td>
                  <td className="py-2.5 pr-6 font-mono text-foreground">{formatCurrency(s.value)}</td>
                  <td className="py-2.5 pr-6 font-mono text-muted">
                    {s.count > 0 ? formatCurrency(s.value / s.count) : "—"}
                  </td>
                  <td className="py-2.5 text-subtle">{s.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
