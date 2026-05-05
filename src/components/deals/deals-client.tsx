"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DealFormDialog } from "@/components/deals/deal-form-dialog"
import { PipelineBoard } from "@/components/deals/pipeline-board"
import { formatCurrency } from "@/lib/utils"
import { Deal as CRMDeal, DealStage } from "@/types/crm-types"
import { useQueryClient } from "@tanstack/react-query"
import { usePaginatedQuery } from "@/hooks/use-paginated-query"
import { useDeals, useCreateDeal, useUpdateDeal, useDeleteDeal, keys, useContacts, useCompanies } from "@/hooks/crm-hooks"

export function DealsClient() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState<CRMDeal | null>(null)

  // 1. Data Hooks
  const { data: dealsData, isLoading } = usePaginatedQuery<CRMDeal>(
    keys.deals.lists(),
    "/api/deals",
    { limit: 500 }
  );

  const { data: contactsData } = useContacts();
  const { data: companiesData } = useCompanies();
  
  const contacts = Array.isArray(contactsData) ? contactsData : contactsData?.data || [];
  const companies = Array.isArray(companiesData) ? companiesData : companiesData?.data || [];
  
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();

  const deals = dealsData?.data || []

  const handleSave = () => {
    setShowForm(false)
    setEditingDeal(null)
    queryClient.invalidateQueries({ queryKey: keys.deals.all });
  };

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    updateDeal.mutate({ id: dealId, data: { stage: newStage } });
  };

  const handleDelete = async (id: string) => {
    deleteDeal.mutate(id);
  };

  const openDeals = deals.filter((d: CRMDeal) => !["WON", "LOST"].includes(d.stage))
  const wonDeals = deals.filter((d: CRMDeal) => d.stage === "WON")
  const pipelineValue = openDeals.reduce((sum: number, d: CRMDeal) => sum + (d.value ?? 0), 0)
  const wonValue = wonDeals.reduce((sum: number, d: CRMDeal) => sum + (d.value ?? 0), 0)
  const weightedValue = openDeals.reduce(
    (sum: number, d: CRMDeal) => sum + (d.value ?? 0) * ((d.probability ?? 50) / 100),
    0
  )

  return (
    <div className="p-6 flex flex-col h-full gap-5 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}

      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Pipeline</h1>
          <p className="text-subtle text-sm mt-1">{deals.length} total deals</p>
        </div>
        <Button onClick={() => { setEditingDeal(null); setShowForm(true) }}>
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        {[
          { label: "Pipeline",  value: formatCurrency(pipelineValue), sub: `${openDeals.length} open`,   color: "text-foreground" },
          { label: "Weighted",  value: formatCurrency(weightedValue),  sub: "by probability",            color: "text-accent" },
          { label: "Won",       value: formatCurrency(wonValue),       sub: `${wonDeals.length} closed`, color: "text-emerald-400" },
          { label: "Lost",      value: deals.filter((d: CRMDeal) => d.stage === "LOST").length.toString(), sub: "deals lost", color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="oled-card p-4">
            <p className="text-subtle text-xs uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-border-hover text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <PipelineBoard
        deals={deals}
        onStageChange={handleStageChange}
        onEdit={(deal) => { setEditingDeal(deal); setShowForm(true) }}
        onDelete={handleDelete}
      />

      <DealFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingDeal(null) }}
        onSave={handleSave}
        deal={editingDeal}
        contacts={contacts}
        companies={companies}
      />
    </div>
  )
}
