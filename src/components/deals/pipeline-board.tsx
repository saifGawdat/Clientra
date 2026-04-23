"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, User, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useConfirm } from "@/components/ui/confirm-modal"

const STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const
type Stage = typeof STAGES[number]

const STAGE_CONFIG: Record<Stage, {
  label: string
  accent: string
  bar: string
  count: string
  empty: string
  drag: string
}> = {
  LEAD:        { label: "Lead",        accent: "border-t-zinc-600",     bar: "bg-zinc-600",     count: "bg-zinc-800 text-zinc-400",          empty: "border-zinc-800/60",   drag: "ring-zinc-600" },
  QUALIFIED:   { label: "Qualified",   accent: "border-t-blue-600",     bar: "bg-blue-500",     count: "bg-blue-950/60 text-blue-400",        empty: "border-blue-900/40",   drag: "ring-blue-500" },
  PROPOSAL:    { label: "Proposal",    accent: "border-t-amber-500",    bar: "bg-amber-500",    count: "bg-amber-950/60 text-amber-400",      empty: "border-amber-900/40",  drag: "ring-amber-500" },
  NEGOTIATION: { label: "Negotiation", accent: "border-t-[#7c3aed]",    bar: "bg-[#7c3aed]",    count: "bg-[#7c3aed]/20 text-[#a78bfa]",     empty: "border-[#7c3aed]/30",  drag: "ring-[#7c3aed]" },
  WON:         { label: "Won",         accent: "border-t-emerald-500",  bar: "bg-emerald-500",  count: "bg-emerald-950/60 text-emerald-400",  empty: "border-emerald-900/40", drag: "ring-emerald-500" },
  LOST:        { label: "Lost",        accent: "border-t-red-600",      bar: "bg-red-600",      count: "bg-red-950/60 text-red-400",          empty: "border-red-900/40",    drag: "ring-red-600" },
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
  const confirm = useConfirm()
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
    <div className="flex gap-3 overflow-x-auto pb-4 flex-1 min-h-0" style={{ scrollbarWidth: "none" }}>
      {STAGES.map((stage) => {
        const cfg = STAGE_CONFIG[stage]
        const stageDeals = dealsByStage[stage]
        const stageValue = stageDeals.reduce((s, d) => s + (d.value ?? 0), 0)
        const isOver = dragOver === stage

        return (
          <div
            key={stage}
            className={cn(
              "flex flex-col rounded-xl min-w-[240px] w-[240px] bg-[#0d0d11] border border-[#1e1e24] border-t-2 transition-all",
              cfg.accent,
              isOver && `ring-1 ${cfg.drag}`
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(stage) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {/* Column header */}
            <div className="px-3 py-3 border-b border-[#1e1e24] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{cfg.label}</span>
                  <span className={cn("text-xs font-bold rounded-full px-1.5 py-0.5 leading-none", cfg.count)}>
                    {stageDeals.length}
                  </span>
                </div>
                {stageValue > 0 && (
                  <span className="text-xs font-mono text-[#52525b]">{formatCurrency(stageValue)}</span>
                )}
              </div>
              {/* Stage progress bar */}
              <div className="mt-2 h-0.5 w-full bg-[#1e1e24] rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", cfg.bar)}
                  style={{ width: stageDeals.length > 0 ? "100%" : "0%" }}
                />
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]" style={{ scrollbarWidth: "none" }}>
              {stageDeals.length === 0 && (
                <div className={cn(
                  "h-16 rounded-lg border-2 border-dashed flex items-center justify-center mt-1",
                  isOver ? cfg.empty : "border-[#1e1e24]"
                )}>
                  <span className="text-[10px] text-[#3f3f46]">Drop here</span>
                </div>
              )}

              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  onDragEnd={() => setDragging(null)}
                  className={cn(
                    "group bg-[#18181b] border border-[#1e1e24] rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:border-[#3f3f46]",
                    dragging === deal.id && "opacity-40 scale-95"
                  )}
                >
                  {/* Title + menu */}
                  <div className="flex items-start justify-between gap-1.5">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="text-sm font-medium text-white hover:text-[#a78bfa] transition-colors leading-snug flex-1 min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {deal.title}
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0 -mt-0.5 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#52525b] hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onEdit(deal)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit deal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {STAGES.filter((s) => s !== stage).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => onStageChange(deal.id, s)}>
                            → {STAGE_CONFIG[s].label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-400 focus:bg-red-950/40"
                          onClick={async () => {
                            if (await confirm({ title: "Delete Deal?", description: "This action cannot be undone.", variant: "destructive" })) {
                              onDelete(deal.id)
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Value */}
                  {deal.value != null && (
                    <p className="text-sm font-bold font-mono text-[#7c3aed] mt-1.5">
                      {formatCurrency(deal.value, deal.currency)}
                    </p>
                  )}

                  {/* Contact / company */}
                  {(deal.contact || deal.company) && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {deal.contact ? (
                        <>
                          <User className="h-3 w-3 text-[#3f3f46] shrink-0" />
                          <span className="text-xs text-[#52525b] truncate">
                            {deal.contact.firstName} {deal.contact.lastName}
                          </span>
                        </>
                      ) : deal.company ? (
                        <>
                          <Building2 className="h-3 w-3 text-[#3f3f46] shrink-0" />
                          <span className="text-xs text-[#52525b] truncate">{deal.company.name}</span>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Probability bar */}
                  {deal.probability != null && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#3f3f46]">Probability</span>
                        <span className="text-[10px] text-[#52525b] font-mono">{deal.probability}%</span>
                      </div>
                      <div className="h-1 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", cfg.bar)}
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
