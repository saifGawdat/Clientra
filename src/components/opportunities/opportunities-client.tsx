"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";

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

export function OpportunitiesClient() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Opportunities are active deals (not WON/LOST)
  // We'll let the user filter by stage later, but for now we fetch all active ones
  const { data, isLoading, error, refetch } = usePaginatedQuery<Opportunity>(
    ["opportunities"],
    "/api/deals",
    { page, limit, search } // We might need a "stage: active" filter in the API if supported
  );

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Error loading opportunities: {(error as Error).message}</p>
        <Button onClick={() => refetch()} className="mt-4" variant="outline">Try Again</Button>
      </div>
    );
  }

  const opportunities = data?.data || [];
  const meta = data?.meta;

  // Filter out WON/LOST locally for now if the API doesn't support "active" filter yet
  // Ideally the API should handle this to save bandwidth
  const activeOpps = opportunities.filter(o => !["WON", "LOST"].includes(o.stage));

  const totalValue = activeOpps.reduce((sum, o) => sum + (o.value ?? 0), 0);
  const weightedValue = activeOpps.reduce(
    (sum, o) => sum + (o.value ?? 0) * ((o.probability ?? 50) / 100),
    0,
  );

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Opportunities
          </h1>
          <p className="text-subtle text-sm mt-1">
            Active deals in your pipeline
          </p>
        </div>
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
            {meta?.total ?? activeOpps.length}
          </p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
        <Input
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-overlay">
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Opportunity</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Contact / Company</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Value</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Probability</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Close Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && activeOpps.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-subtle">
                  {search
                    ? "No opportunities match your search"
                    : "No open opportunities. Create deals to see them here."}
                </td>
              </tr>
            )}
            {activeOpps.map((opp) => (
              <tr
                key={opp.id}
                className="hover:bg-surface transition-colors"
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

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-subtle">
            Showing <span className="text-foreground font-medium">{activeOpps.length}</span> of <span className="text-foreground font-medium">{meta.total}</span> opportunities
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => setPage(p => p - 1)}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-xs font-medium">{page}</span>
              <span className="text-xs text-subtle">/</span>
              <span className="text-xs text-subtle">{meta.totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasMore || isLoading}
              onClick={() => setPage(p => p + 1)}
              className="h-8 px-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
