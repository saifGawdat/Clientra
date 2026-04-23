"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DealFormDialog } from "@/components/deals/deal-form-dialog"
import { PipelineBoard } from "@/components/deals/pipeline-board"

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

  const totalPipeline = deals
    .filter((d) => !["WON", "LOST"].includes(d.stage))
    .reduce((sum, d) => sum + (d.value ?? 0), 0)

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">{deals.length} total deals</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
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
