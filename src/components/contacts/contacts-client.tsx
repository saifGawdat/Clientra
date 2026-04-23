"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog"
import { formatDate } from "@/lib/utils"

type Contact = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  title: string | null
  status: string
  source: string
  tags: string[]
  companyId: string | null
  company: { id: string; name: string } | null
  createdAt: Date
}

type Company = { id: string; name: string }

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  TARGET: "warning",
  LEAD: "secondary",
  PROSPECT: "default",
  CUSTOMER: "success",
  CHURNED: "destructive",
  INACTIVE: "secondary",
}

interface ContactsClientProps {
  initialContacts: Contact[]
  companies: Company[]
}

export function ContactsClient({ initialContacts, companies }: ContactsClientProps) {
  const router = useRouter()
  const [contacts, setContacts] = useState(initialContacts)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase()
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.name.toLowerCase().includes(q) ||
      false
    )
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return
    await fetch(`/api/contacts/${id}`, { method: "DELETE" })
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSave = (contact: Contact) => {
    setContacts((prev) => {
      const idx = prev.findIndex((c) => c.id === contact.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = contact
        return next
      }
      return [contact, ...prev]
    })
    setShowForm(false)
    setEditingContact(null)
  }

  return (
    <div className="p-8 space-y-6 bg-[#09090b] min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contacts</h1>
          <p className="text-[#52525b] text-sm mt-1">{contacts.length} total contacts</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border border-[#1e1e24] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e24] bg-[#18181b]">
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Name</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Company</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Email</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Status</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#52525b]">
                  {search ? "No contacts match your search" : "No contacts yet. Add your first one!"}
                </td>
              </tr>
            )}
            {filtered.map((contact) => (
              <tr key={contact.id} className="border-b border-[#1e1e24] hover:bg-[#18181b] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#7c3aed]">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-[#7c3aed] transition-colors">
                        {contact.firstName} {contact.lastName}
                      </p>
                      {contact.title && <p className="text-xs text-[#52525b]">{contact.title}</p>}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#a1a1aa]">
                  {contact.company ? (
                    <Link href={`/companies/${contact.company.id}`} className="hover:text-white transition-colors">
                      {contact.company.name}
                    </Link>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-[#a1a1aa]">{contact.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[contact.status]}>{contact.status}</Badge>
                </td>
                <td className="px-4 py-3 text-[#52525b]">{formatDate(contact.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditingContact(contact); setShowForm(true) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-400 hover:bg-red-950/30"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContactFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingContact(null) }}
        onSave={handleSave}
        contact={editingContact}
        companies={companies}
      />
    </div>
  )
}
