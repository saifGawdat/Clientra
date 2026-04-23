"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Building2, Tag, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, formatDate } from "@/lib/utils"

const statusVariant: Record<string, any> = {
  LEAD: "secondary", PROSPECT: "default", CUSTOMER: "success", CHURNED: "destructive", INACTIVE: "secondary",
}
const dealStageVariant: Record<string, any> = {
  LEAD: "secondary", QUALIFIED: "default", PROPOSAL: "warning", NEGOTIATION: "purple", WON: "success", LOST: "destructive",
}

export function ContactDetail({ contact: initialContact, companies }: { contact: any; companies: any[] }) {
  const router = useRouter()
  const [contact, setContact] = useState(initialContact)
  const [showEdit, setShowEdit] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [savingNote, setSavingNote] = useState(false)

  const handleAddNote = async () => {
    if (!noteContent.trim()) return
    setSavingNote(true)
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteContent.trim(), contactId: contact.id }),
    })
    if (res.ok) {
      const note = await res.json()
      setContact((prev: any) => ({ ...prev, notes: [note, ...prev.notes] }))
      setNoteContent("")
    }
    setSavingNote(false)
  }

  const handleDeleteNote = async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" })
    setContact((prev: any) => ({ ...prev, notes: prev.notes.filter((n: any) => n.id !== noteId) }))
  }

  const handleDelete = async () => {
    if (!confirm("Delete this contact? This cannot be undone.")) return
    await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" })
    router.push("/contacts")
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/contacts">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{contact.firstName} {contact.lastName}</h1>
          {contact.title && <p className="text-gray-500 text-sm">{contact.title}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-blue-700">
                    {contact.firstName[0]}{contact.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{contact.firstName} {contact.lastName}</p>
                  <Badge variant={statusVariant[contact.status]} className="text-xs mt-1">{contact.status}</Badge>
                </div>
              </div>

              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-blue-600">{contact.email}</a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <a href={`tel:${contact.phone}`} className="hover:text-blue-600">{contact.phone}</a>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <Link href={`/companies/${contact.company.id}`} className="hover:text-blue-600">
                    {contact.company.name}
                  </Link>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                <div className="flex justify-between"><span>Source</span><span className="font-medium text-gray-700">{contact.source}</span></div>
                <div className="flex justify-between"><span>Created</span><span className="font-medium text-gray-700">{formatDate(contact.createdAt)}</span></div>
              </div>

              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                      <Tag className="h-2.5 w-2.5" />{tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="deals">
            <TabsList>
              <TabsTrigger value="deals">Deals ({contact.deals.length})</TabsTrigger>
              <TabsTrigger value="activities">Activities ({contact.activities.length})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({contact.notes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="mt-4 space-y-2">
              {contact.deals.length === 0 && (
                <p className="text-sm text-gray-400 py-4">No deals associated with this contact.</p>
              )}
              {contact.deals.map((deal: any) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <Card className="hover:border-blue-200 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{deal.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(deal.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {deal.value && <span className="text-sm font-medium text-gray-700">{formatCurrency(deal.value)}</span>}
                        <Badge variant={dealStageVariant[deal.stage]}>{deal.stage}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="activities" className="mt-4 space-y-2">
              {contact.activities.length === 0 && (
                <p className="text-sm text-gray-400 py-4">No activities yet.</p>
              )}
              {contact.activities.map((act: any) => (
                <Card key={act.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{act.subject}</p>
                        {act.description && <p className="text-xs text-gray-500 mt-1">{act.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <Badge variant="secondary" className="text-xs">{act.type}</Badge>
                        <span className="text-xs text-gray-400">{formatDate(act.createdAt)}</span>
                      </div>
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
              {contact.notes.length === 0 && (
                <p className="text-sm text-gray-400 py-2">No notes yet.</p>
              )}
              {contact.notes.map((note: any) => (
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

      <ContactFormDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(updated) => { setContact({ ...contact, ...updated }); setShowEdit(false) }}
        contact={contact}
        companies={companies}
      />
    </div>
  )
}
