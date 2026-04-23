"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"

const STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const
type Stage = typeof STAGES[number]

const stageConfig: Record<Stage, { label: string; color: string; headerColor: string }> = {
  LEAD:        { label: "Lead",        color: "bg-gray-50",   headerColor: "bg-gray-200 text-gray-700" },
  QUALIFIED:   { label: "Qualified",   color: "bg-blue-50",   headerColor: "bg-blue-200 text-blue-800" },
  PROPOSAL:    { label: "Proposal",    color: "bg-yellow-50", headerColor: "bg-yellow-200 text-yellow-800" },
  NEGOTIATION: { label: "Negotiation", color: "bg-purple-50", headerColor: "bg-purple-200 text-purple-800" },
  WON:         { label: "Won",         color: "bg-green-50",  headerColor: "bg-green-200 text-green-800" },
  LOST:        { label: "Lost",        color: "bg-red-50",    headerColor: "bg-red-200 text-red-800" },
}

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

interface PipelineBoardProps {
  deals: Deal[]
  onStageChange: (dealId: string, stage: Stage) => void
  onEdit: (deal: Deal) => void
  onDelete: (dealId: string) => void
}

export function PipelineBoard({ deals, onStageChange, onEdit, onDelete }: PipelineBoardProps) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<Stage | null>(null)

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter((d) => d.stage === stage)
    return acc
  }, {} as Record<Stage, Deal[]>)

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDragging(dealId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault()
    if (dragging) onStageChange(dragging, stage)
    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 flex-1 min-h-0">
      {STAGES.map((stage) => {
        const config = stageConfig[stage]
        const stageDeal = dealsByStage[stage]
        const stageValue = stageDeal.reduce((s, d) => s + (d.value ?? 0), 0)

        return (
          <div
            key={stage}
            className={`flex flex-col rounded-xl min-w-[240px] w-[240px] transition-colors ${
              dragOver === stage ? "ring-2 ring-blue-400" : ""
            } ${config.color}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(stage) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${config.headerColor}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{config.label}</span>
                <span className="text-xs font-bold bg-white/60 rounded-full px-1.5 py-0.5">
                  {stageDeal.length}
                </span>
              </div>
              {stageValue > 0 && (
                <span className="text-xs font-medium">{formatCurrency(stageValue)}</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
              {stageDeal.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`cursor-grab active:cursor-grabbing transition-opacity ${
                    dragging === deal.id ? "opacity-50" : ""
                  }`}
                >
                  <Card className="shadow-xs hover:shadow-sm transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 leading-tight flex-1">{deal.title}</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 -mt-0.5 -mr-1">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(deal)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" />Edit
                            </DropdownMenuItem>
                            {STAGES.filter((s) => s !== stage).map((s) => (
                              <DropdownMenuItem key={s} onClick={() => onStageChange(deal.id, s)}>
                                Move to {stageConfig[s].label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-600"
                              onClick={() => { if (confirm("Delete this deal?")) onDelete(deal.id) }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {deal.value && (
                        <p className="text-sm font-semibold text-gray-800 mt-1.5">
                          {formatCurrency(deal.value, deal.currency)}
                        </p>
                      )}

                      {(deal.contact || deal.company) && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {deal.contact
                            ? `${deal.contact.firstName} ${deal.contact.lastName}`
                            : deal.company?.name}
                        </p>
                      )}

                      {deal.probability != null && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                            <span>Probability</span>
                            <span>{deal.probability}%</span>
                          </div>
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
