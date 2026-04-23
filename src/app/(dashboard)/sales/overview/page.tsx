import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"

const STAGES = [
  { key: "LEAD", label: "Lead", color: "bg-[#3f3f46]" },
  { key: "QUALIFIED", label: "Qualified", color: "bg-blue-700" },
  { key: "PROPOSAL", label: "Proposal", color: "bg-amber-600" },
  { key: "NEGOTIATION", label: "Negotiation", color: "bg-[#7c3aed]" },
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
  const userId = session!.user.id

  const [deals, contacts] = await Promise.all([
    prisma.deal.findMany({ where: { ownerId: userId } }),
    prisma.contact.findMany({ where: { ownerId: userId } }),
  ])

  const totalDeals = deals.length
  const maxCount = Math.max(...STAGES.map((s) => deals.filter((d) => d.stage === s.key).length), 1)

  const stageStats = STAGES.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage.key)
    return {
      ...stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
      pct: totalDeals > 0 ? Math.round((stageDeals.length / totalDeals) * 100) : 0,
      barPct: maxCount > 0 ? Math.round((stageDeals.length / maxCount) * 100) : 0,
    }
  })

  const wonDeals = deals.filter((d) => d.stage === "WON")
  const lostDeals = deals.filter((d) => d.stage === "LOST")
  const openDeals = deals.filter((d) => !["WON", "LOST"].includes(d.stage))
  const closedCount = wonDeals.length + lostDeals.length
  const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0
  const conversionRate =
    contacts.length > 0
      ? Math.round((contacts.filter((c) => c.status === "CUSTOMER").length / contacts.length) * 100)
      : 0

  const sourceBreakdown = Object.entries(
    contacts.reduce<Record<string, number>>((acc, c) => {
      acc[c.source] = (acc[c.source] ?? 0) + 1
      return acc
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const maxSourceCount = Math.max(...sourceBreakdown.map(([, count]) => count), 1)

  return (
    <div className="p-8 space-y-8 bg-[#09090b] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sales Overview</h1>
        <p className="text-[#52525b] text-sm mt-1">Pipeline health and conversion analysis</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Deals", value: totalDeals.toString() },
          { label: "Open Pipeline", value: formatCurrency(openDeals.reduce((s, d) => s + (d.value ?? 0), 0)) },
          { label: "Win Rate", value: `${winRate}%` },
          { label: "Contact Conversion", value: `${conversionRate}%` },
        ].map((s) => (
          <div key={s.label} className="oled-card">
            <p className="text-[#52525b] text-xs uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-bold font-mono text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
        <div className="oled-card space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#52525b]">Pipeline Funnel</p>
          <div className="space-y-3">
            {stageStats.map((stage) => (
              <div key={stage.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#a1a1aa] font-medium">{stage.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#52525b] text-xs">{stage.pct}%</span>
                    <span className="font-mono text-white text-xs w-16 text-right">
                      {formatCurrency(stage.value)}
                    </span>
                    <span className="text-[#52525b] text-xs w-12 text-right">{stage.count} deals</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[#18181b] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${stage.color}`}
                    style={{ width: `${stage.barPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead source breakdown */}
        <div className="oled-card space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#52525b]">Contacts by Source</p>
          {sourceBreakdown.length === 0 ? (
            <p className="text-[#52525b] text-sm py-4 text-center">No contacts yet</p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map(([source, count]) => (
                <div key={source} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#a1a1aa]">{SOURCE_LABELS[source] ?? source}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#52525b] text-xs">
                        {contacts.length > 0 ? Math.round((count / contacts.length) * 100) : 0}%
                      </span>
                      <span className="text-white text-xs w-8 text-right">{count}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[#18181b] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#7c3aed] transition-all"
                      style={{ width: `${Math.round((count / maxSourceCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stage value breakdown table */}
      <div className="oled-card space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#52525b]">Stage Breakdown</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e24]">
                {["Stage", "Deals", "Total Value", "Avg Value", "% of Pipeline"].map((h) => (
                  <th key={h} className="text-left pb-2 font-medium text-[#52525b] text-xs uppercase tracking-wider pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stageStats.map((s) => (
                <tr key={s.key} className="border-b border-[#1e1e24] last:border-0">
                  <td className="py-2.5 pr-6">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${s.color}`} />
                      <span className="text-white font-medium">{s.label}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-6 text-[#a1a1aa]">{s.count}</td>
                  <td className="py-2.5 pr-6 font-mono text-white">{formatCurrency(s.value)}</td>
                  <td className="py-2.5 pr-6 font-mono text-[#a1a1aa]">
                    {s.count > 0 ? formatCurrency(s.value / s.count) : "—"}
                  </td>
                  <td className="py-2.5 text-[#52525b]">{s.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
