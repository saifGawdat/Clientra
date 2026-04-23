"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Filter, Trash2, Pencil, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{contacts.length} total contacts</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    {search ? "No contacts match your search" : "No contacts yet. Add your first one!"}
                  </td>
                </tr>
              )}
              {filtered.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3 group">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-blue-700">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.title && <p className="text-xs text-gray-400">{contact.title}</p>}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {contact.company ? (
                      <Link href={`/companies/${contact.company.id}`} className="hover:text-blue-600 hover:underline">
                        {contact.company.name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contact.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[contact.status]}>{contact.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(contact.createdAt)}</td>
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
                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
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
      </Card>

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
