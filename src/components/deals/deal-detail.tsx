"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Pencil, Trash2, User, Building2,
  Calendar, DollarSign, Tag, Plus, Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DealFormDialog } from "@/components/deals/deal-form-dialog"
import { formatCurrency, formatDate } from "@/lib/utils"

const stageVariant: Record<string, any> = {
  LEAD: "secondary", QUALIFIED: "default", PROPOSAL: "warning",
  NEGOTIATION: "purple", WON: "success", LOST: "destructive",
}
const activityTypeColor: Record<string, string> = {
  CALL: "text-blue-500 bg-blue-50",
  EMAIL: "text-purple-500 bg-purple-50",
  MEETING: "text-green-500 bg-green-50",
  TASK: "text-orange-500 bg-orange-50",
  NOTE: "text-gray-500 bg-gray-50",
}

type Deal = {
  id: string
  title: string
  value: number | null
  currency: string
  stage: string
  probability: number | null
  closeDate: Date | null
  description: string | null
  contactId: string | null
  companyId: string | null
  contact: { id: string; firstName: string; lastName: string } | null
  company: { id: string; name: string } | null
  activities: { id: string; type: string; subject: string; description: string | null; status: string; scheduledAt: Date | null; createdAt: Date }[]
  notes: { id: string; content: string; createdAt: Date }[]
  createdAt: Date
  updatedAt: Date
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
  const [deal, setDeal] = useState(initialDeal)
  const [showEdit, setShowEdit] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [savingNote, setSavingNote] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Delete this deal? This cannot be undone.")) return
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
      setDeal((prev) => ({ ...prev, notes: [note, ...prev.notes] }))
      setNoteContent("")
    }
    setSavingNote(false)
  }

  const handleDeleteNote = async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" })
    setDeal((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== noteId) }))
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/deals">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
          <Badge variant={stageVariant[deal.stage]} className="mt-1">{deal.stage}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            variant="outline" size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              {deal.value != null && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <DollarSign className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(deal.value, deal.currency)}</span>
                </div>
              )}

              {deal.probability != null && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Win probability</span>
                    <span className="font-medium">{deal.probability}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${deal.probability}%` }} />
                  </div>
                </div>
              )}

              {deal.closeDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>Expected close: <span className="font-medium">{formatDate(deal.closeDate)}</span></span>
                </div>
              )}

              {deal.contact && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <Link href={`/contacts/${deal.contact.id}`} className="hover:text-blue-600">
                    {deal.contact.firstName} {deal.contact.lastName}
                  </Link>
                </div>
              )}

              {deal.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <Link href={`/companies/${deal.company.id}`} className="hover:text-blue-600">
                    {deal.company.name}
                  </Link>
                </div>
              )}

              {deal.description && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{deal.description}</p>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span className="font-medium text-gray-700">{formatDate(deal.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated</span>
                  <span className="font-medium text-gray-700">{formatDate(deal.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="activities">
            <TabsList>
              <TabsTrigger value="activities">Activities ({deal.activities.length})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({deal.notes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="mt-4 space-y-2">
              {deal.activities.length === 0 && (
                <p className="text-sm text-gray-400 py-4">No activities for this deal.</p>
              )}
              {deal.activities.map((act) => (
                <Card key={act.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${activityTypeColor[act.type] ?? "text-gray-500 bg-gray-50"}`}>
                          {act.type[0]}
                        </span>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{act.subject}</p>
                          {act.description && <p className="text-xs text-gray-500 mt-0.5">{act.description}</p>}
                          {act.scheduledAt && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(act.scheduledAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">{act.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-3">
              <Card>
                <CardContent className="p-3 space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleAddNote} disabled={savingNote || !noteContent.trim()}>
                      <Send className="h-3.5 w-3.5" />
                      {savingNote ? "Saving..." : "Add note"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {deal.notes.length === 0 && (
                <p className="text-sm text-gray-400 py-2">No notes yet.</p>
              )}
              {deal.notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">{formatDate(note.createdAt)}</p>
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <DealFormDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(updated) => { setDeal((prev) => ({ ...prev, ...updated })); setShowEdit(false) }}
        deal={deal}
        contacts={contacts}
        companies={companies}
      />
    </div>
  )
}
