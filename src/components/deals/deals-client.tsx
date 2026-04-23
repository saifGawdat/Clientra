"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DealFormDialog } from "@/components/deals/deal-form-dialog"
import { PipelineBoard } from "@/components/deals/pipeline-board"
import { formatCurrency } from "@/lib/utils"

const STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const
type Stage = typeof STAGES[number]

type Deal = {
  id: string
  title: string
  value: number | null
  currency: string
  stage: Stage
  probability: number | null
  closeDate: Date | null
  description: string | null
  contactId: string | null
  companyId: string | null
  contact: { id: string; firstName: string; lastName: string } | null
  company: { id: string; name: string } | null
  createdAt: Date
  updatedAt: Date
}

interface DealsClientProps {
  initialDeals: Deal[]
  contacts: { id: string; firstName: string; lastName: string }[]
  companies: { id: string; name: string }[]
}

export function DealsClient({ initialDeals, contacts, companies }: DealsClientProps) {
  const [deals, setDeals] = useState(initialDeals)
  const [showForm, setShowForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)

  const handleSave = (deal: Deal) => {
    setDeals((prev) => {
      const idx = prev.findIndex((d) => d.id === deal.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = deal
        return next
      }
      return [deal, ...prev]
    })
    setShowForm(false)
    setEditingDeal(null)
  }

  const handleStageChange = async (dealId: string, newStage: Stage) => {
    const res = await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    })
    if (res.ok) {
      const updated = await res.json()
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, ...updated } : d)))
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/deals/${id}`, { method: "DELETE" })
    setDeals((prev) => prev.filter((d) => d.id !== id))
  }

  const openDeals = deals.filter((d) => !["WON", "LOST"].includes(d.stage))
  const wonDeals = deals.filter((d) => d.stage === "WON")
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)
  const weightedValue = openDeals.reduce(
    (sum, d) => sum + (d.value ?? 0) * ((d.probability ?? 50) / 100),
    0
  )

  return (
    <div className="p-6 flex flex-col h-full gap-5 bg-[#09090b]">
      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline</h1>
          <p className="text-[#52525b] text-sm mt-1">{deals.length} total deals</p>
        </div>
        <Button onClick={() => { setEditingDeal(null); setShowForm(true) }}>
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        {[
          { label: "Pipeline",  value: formatCurrency(pipelineValue), sub: `${openDeals.length} open`,   color: "text-white" },
          { label: "Weighted",  value: formatCurrency(weightedValue),  sub: "by probability",            color: "text-[#7c3aed]" },
          { label: "Won",       value: formatCurrency(wonValue),       sub: `${wonDeals.length} closed`, color: "text-emerald-400" },
          { label: "Lost",      value: deals.filter(d => d.stage === "LOST").length.toString(), sub: "deals lost", color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0d0d11] border border-[#1e1e24] rounded-xl p-4">
            <p className="text-[#52525b] text-xs uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[#3f3f46] text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Board */}
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
