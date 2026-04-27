"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

const STAGE_COLORS: Record<string, string> = {
  LEAD: "bg-surface-raised text-muted border-border-hover",
  QUALIFIED: "bg-blue-950/50 text-blue-300 border-blue-800/50",
  PROPOSAL: "bg-amber-950/50 text-amber-300 border-amber-800/50",
  NEGOTIATION: "bg-accent/20 text-accent-light border-accent/40",
};

type Opportunity = {
  id: string;
  title: string;
  value: number | null;
  currency: string;
  stage: string;
  probability: number | null;
  closeDate: Date | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
  updatedAt: Date;
};

interface OpportunitiesClientProps {
  initialOpportunities: Opportunity[];
}

export function OpportunitiesClient({
  initialOpportunities,
}: OpportunitiesClientProps) {
  const [opportunities] = useState(initialOpportunities);
  const [search, setSearch] = useState("");

  const filtered = opportunities.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      o.company?.name.toLowerCase().includes(q) ||
      `${o.contact?.firstName ?? ""} ${o.contact?.lastName ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  });

  const totalValue = opportunities.reduce((sum, o) => sum + (o.value ?? 0), 0);
  const weightedValue = opportunities.reduce(
    (sum, o) => sum + (o.value ?? 0) * ((o.probability ?? 50) / 100),
    0,
  );

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Opportunities
        </h1>
        <p className="text-subtle text-sm mt-1">
          Active deals in your pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="oled-card">
          <p className="text-subtle text-xs uppercase tracking-widest mb-2">Pipeline Value</p>
          <p className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="oled-card">
          <p className="text-subtle text-xs uppercase tracking-widest mb-2">Weighted Value</p>
          <p className="text-2xl font-bold font-mono text-accent">
            {formatCurrency(weightedValue)}
          </p>
        </div>
        <div className="oled-card">
          <p className="text-subtle text-xs uppercase tracking-widest mb-2">Open Deals</p>
          <p className="text-3xl font-bold font-mono text-foreground">
            {opportunities.length}
          </p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
        <Input
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Opportunity</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Contact / Company</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Value</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Probability</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Close Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-subtle">
                  {search
                    ? "No opportunities match your search"
                    : "No open opportunities. Create deals to see them here."}
                </td>
              </tr>
            )}
            {filtered.map((opp) => (
              <tr
                key={opp.id}
                className="border-b border-border hover:bg-surface transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/deals/${opp.id}`}
                    className="font-medium text-foreground hover:text-accent transition-colors"
                  >
                    {opp.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    {opp.contact && (
                      <Link
                        href={`/contacts/${opp.contact.id}`}
                        className="block text-muted hover:text-foreground transition-colors text-xs"
                      >
                        {opp.contact.firstName} {opp.contact.lastName}
                      </Link>
                    )}
                    {opp.company && (
                      <Link
                        href={`/companies/${opp.company.id}`}
                        className="block text-subtle hover:text-muted transition-colors text-xs"
                      >
                        {opp.company.name}
                      </Link>
                    )}
                    {!opp.contact && !opp.company && (
                      <span className="text-subtle">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STAGE_COLORS[opp.stage] ?? STAGE_COLORS.LEAD}`}
                  >
                    {opp.stage}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-foreground">
                  {opp.value != null
                    ? formatCurrency(opp.value, opp.currency)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {opp.probability != null ? (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-surface-raised overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${opp.probability}%` }}
                        />
                      </div>
                      <span className="text-muted text-xs">{opp.probability}%</span>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-subtle">
                  {opp.closeDate ? formatDate(opp.closeDate) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
