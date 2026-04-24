"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Pencil, Trash2, User, Building2,
  Calendar, TrendingUp, MessageSquare, Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DealFormDialog } from "@/components/deals/deal-form-dialog"
import { useConfirm } from "@/components/ui/confirm-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Deal, Contact, Company, Note, CRMActivity } from "@/types/crm-types"

const STAGE_COLORS: Record<string, string> = {
  LEAD:        "bg-zinc-800 text-zinc-300 border-zinc-700",
  QUALIFIED:   "bg-blue-950/50 text-blue-300 border-blue-800/50",
  PROPOSAL:    "bg-amber-950/50 text-amber-300 border-amber-800/50",
  NEGOTIATION: "bg-[#7c3aed]/20 text-[#a78bfa] border-[#7c3aed]/40",
  WON:         "bg-emerald-950/50 text-emerald-300 border-emerald-800/50",
  LOST:        "bg-red-950/50 text-red-300 border-red-800/50",
}

const STAGE_BAR: Record<string, string> = {
  LEAD: "bg-zinc-600", QUALIFIED: "bg-blue-500", PROPOSAL: "bg-amber-500",
  NEGOTIATION: "bg-[#7c3aed]", WON: "bg-emerald-500", LOST: "bg-red-600",
}

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  CALL:    "text-blue-400 bg-blue-950/40 border-blue-800/30",
  EMAIL:   "text-[#a78bfa] bg-[#7c3aed]/20 border-[#7c3aed]/30",
  MEETING: "text-emerald-400 bg-emerald-950/40 border-emerald-800/30",
  TASK:    "text-amber-400 bg-amber-950/40 border-amber-800/30",
  NOTE:    "text-zinc-400 bg-zinc-900 border-zinc-800",
}



export function DealDetail({
  deal: initialDeal,
  contacts,
  companies,
}: {
  deal: Deal
  contacts: { id: string; firstName: string; lastName: string }[]
  companies: { id: string; name: string }[]
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const [deal, setDeal] = useState(initialDeal)
  const [showEdit, setShowEdit] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [savingNote, setSavingNote] = useState(false)

  const handleDelete = async () => {
    if (!(await confirm({ 
      title: "Delete Deal?", 
      description: "This action cannot be undone.",
      variant: "destructive" 
    }))) return
    await fetch(`/api/deals/${deal.id}`, { method: "DELETE" })
    router.push("/deals")
  }

  const handleAddNote = async () => {
    if (!noteContent.trim()) return
    setSavingNote(true)
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteContent.trim(), dealId: deal.id }),
    })
    if (res.ok) {
      const note = await res.json()
      setDeal((prev) => ({ ...prev, notes: [note, ...(prev.notes ?? [])] }))
      setNoteContent("")
    }
    setSavingNote(false)
  }

  const handleDeleteNote = async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" })
    setDeal((prev) => ({ ...prev, notes: (prev.notes ?? []).filter((n) => n.id !== noteId) }))
  }

  const stageBarColor = STAGE_BAR[deal.stage] ?? "bg-zinc-600"
  const stageColor = STAGE_COLORS[deal.stage] ?? STAGE_COLORS.LEAD

  return (
    <div className="p-8 space-y-6 bg-[#09090b] min-h-full">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <Link href="/pipeline">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#52525b] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-white tracking-tight truncate">{deal.title}</h1>
            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border", stageColor)}>
              {deal.stage}
            </span>
          </div>
          {deal.value != null && (
            <p className="text-[#7c3aed] font-bold font-mono text-lg mt-0.5">
              {formatCurrency(deal.value, deal.currency)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-400 hover:bg-red-950/30"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Deal info */}
          <div className="oled-card space-y-4">
            {/* Probability */}
            {deal.probability != null && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#52525b]">Win probability</span>
                  <span className="text-xs font-mono text-[#a1a1aa]">{deal.probability}%</span>
                </div>
                <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", stageBarColor)}
                    style={{ width: `${deal.probability}%` }}
                  />
                </div>
              </div>
            )}

            {/* Links */}
            <div className="space-y-2.5">
              {deal.closeDate && (
                <div className="flex items-center gap-2.5 text-sm text-[#a1a1aa]">
                  <Calendar className="h-3.5 w-3.5 text-[#52525b] shrink-0" />
                  <span>Close: <span className="text-white">{formatDate(deal.closeDate)}</span></span>
                </div>
              )}
              {deal.contact && (
                <Link
                  href={`/contacts/${deal.contact.id}`}
                  className="flex items-center gap-2.5 text-sm text-[#a1a1aa] hover:text-white transition-colors group"
                >
                  <User className="h-3.5 w-3.5 text-[#52525b] group-hover:text-[#7c3aed] shrink-0 transition-colors" />
                  <span>{deal.contact.firstName} {deal.contact.lastName}</span>
                </Link>
              )}
              {deal.company && (
                <Link
                  href={`/companies/${deal.company.id}`}
                  className="flex items-center gap-2.5 text-sm text-[#a1a1aa] hover:text-white transition-colors group"
                >
                  <Building2 className="h-3.5 w-3.5 text-[#52525b] group-hover:text-[#7c3aed] shrink-0 transition-colors" />
                  <span>{deal.company.name}</span>
                </Link>
              )}
            </div>

            {deal.description && (
              <div className="pt-3 border-t border-[#1e1e24]">
                <p className="text-xs text-[#52525b] mb-1.5">Description</p>
                <p className="text-sm text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">{deal.description}</p>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="oled-card space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#52525b]">Details</p>
            <div className="space-y-2.5">
              {[
                { label: "Stage",   value: deal.stage },
                { label: "Created", value: formatDate(deal.createdAt) },
                { label: "Updated", value: formatDate(deal.updatedAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#52525b]">{label}</span>
                  <span className="text-xs text-[#a1a1aa] font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: TrendingUp,    label: "Activities", value: (deal.activities ?? []).length },
              { icon: MessageSquare, label: "Notes",       value: (deal.notes ?? []).length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="oled-card py-3 px-3 text-center">
                <Icon className="h-3.5 w-3.5 text-[#52525b] mx-auto mb-1" />
                <p className="text-lg font-bold font-mono text-white leading-none">{value}</p>
                <p className="text-[10px] text-[#52525b] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div>
          <Tabs defaultValue="activities">
            <TabsList className="mb-4">
              <TabsTrigger value="activities">Activities ({(deal.activities ?? []).length})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({(deal.notes ?? []).length})</TabsTrigger>
            </TabsList>

            {/* Activities */}
            <TabsContent value="activities" className="space-y-2">
              {(deal.activities ?? []).length === 0 ? (
                <div className="py-12 text-center text-[#52525b] text-sm">No activities logged for this deal.</div>
              ) : (
                (deal.activities ?? []).map((act: CRMActivity) => {
                  const colorClass = ACTIVITY_TYPE_COLORS[act.type] ?? ACTIVITY_TYPE_COLORS.NOTE
                  return (
                    <div key={act.id} className="oled-card flex items-start gap-4">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold", colorClass)}>
                        {act.type[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white">{act.subject}</p>
                        {act.description && (
                          <p className="text-xs text-[#52525b] mt-0.5 truncate">{act.description}</p>
                        )}
                        {act.scheduledAt && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-[#52525b]" />
                            <span className="text-xs text-[#52525b]">{formatDate(act.scheduledAt)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[#52525b]">{formatDate(act.createdAt)}</p>
                        <span className={cn(
                          "text-xs font-medium",
                          act.status === "COMPLETED" ? "text-emerald-400" :
                          act.status === "IN_PROGRESS" ? "text-amber-400" :
                          act.status === "CANCELLED" ? "text-red-400" : "text-[#52525b]"
                        )}>
                          {act.status}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes" className="space-y-3">
              <div className="oled-card space-y-3">
                <Textarea
                  placeholder="Write a note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleAddNote} disabled={savingNote || !noteContent.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    {savingNote ? "Saving..." : "Add note"}
                  </Button>
                </div>
              </div>

              {(deal.notes ?? []).length === 0 ? (
                <div className="py-8 text-center text-[#52525b] text-sm">No notes yet.</div>
              ) : (
                (deal.notes ?? []).map((note: Note) => (
                  <div key={note.id} className="oled-card">
                    <p className="text-sm text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e1e24]">
                      <span className="text-xs text-[#52525b]">{formatDate(note.createdAt)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[#52525b] hover:text-red-400 hover:bg-red-950/30"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <DealFormDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(updated: Partial<Deal>) => { setDeal((prev) => ({ ...prev, ...updated })); setShowEdit(false) }}
        deal={deal}
        contacts={contacts}
        companies={companies}
      />
    </div>
  )
}
