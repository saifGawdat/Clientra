"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Trash2, Pencil, Mail, Phone, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

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

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "success" | "warning" | "destructive"; label: string; dot: string }> = {
  TARGET:   { variant: "warning",     label: "Target",   dot: "bg-amber-400" },
  LEAD:     { variant: "secondary",   label: "Lead",     dot: "bg-zinc-400" },
  PROSPECT: { variant: "default",     label: "Prospect", dot: "bg-blue-400" },
  CUSTOMER: { variant: "success",     label: "Customer", dot: "bg-emerald-400" },
  CHURNED:  { variant: "destructive", label: "Churned",  dot: "bg-red-400" },
  INACTIVE: { variant: "secondary",   label: "Inactive", dot: "bg-zinc-600" },
}

const ALL_STATUSES = ["TARGET", "LEAD", "PROSPECT", "CUSTOMER", "CHURNED", "INACTIVE"] as const

interface ContactsClientProps {
  initialContacts: Contact[]
  companies: Company[]
}

export function ContactsClient({ initialContacts, companies }: ContactsClientProps) {
  const [contacts, setContacts] = useState(initialContacts)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch =
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.name.toLowerCase().includes(q) ||
      false
    const matchesStatus = !filterStatus || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const counts = {
    total: contacts.length,
    customers: contacts.filter((c) => c.status === "CUSTOMER").length,
    leads: contacts.filter((c) => c.status === "LEAD" || c.status === "PROSPECT").length,
    targets: contacts.filter((c) => c.status === "TARGET").length,
  }

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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contacts</h1>
          <p className="text-[#52525b] text-sm mt-1">Manage your people and relationships</p>
        </div>
        <Button onClick={() => { setEditingContact(null); setShowForm(true) }}>
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total, color: "text-white" },
          { label: "Customers", value: counts.customers, color: "text-emerald-400" },
          { label: "Leads & Prospects", value: counts.leads, color: "text-blue-400" },
          { label: "Targets", value: counts.targets, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="oled-card py-4">
            <p className="text-[#52525b] text-xs uppercase tracking-widest mb-1">{s.label}</p>
            <p className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterStatus("")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              !filterStatus
                ? "bg-[#7c3aed] text-white"
                : "bg-[#18181b] border border-[#1e1e24] text-[#52525b] hover:text-[#a1a1aa]"
            )}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                filterStatus === s
                  ? "bg-[#7c3aed] text-white"
                  : "bg-[#18181b] border border-[#1e1e24] text-[#52525b] hover:text-[#a1a1aa]"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_CONFIG[s]?.dot)} />
              {STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#1e1e24] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e24] bg-[#0d0d11]">
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Name</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs hidden md:table-cell">Company</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs hidden lg:table-cell">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Status</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs hidden sm:table-cell">Added</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e24]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-[#52525b] text-sm">
                    {search || filterStatus ? "No contacts match your filters" : "No contacts yet. Add your first one!"}
                  </p>
                </td>
              </tr>
            )}
            {filtered.map((contact) => {
              const cfg = STATUS_CONFIG[contact.status]
              return (
                <tr
                  key={contact.id}
                  className="hover:bg-[#0d0d11] transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#7c3aed]/15 border border-[#7c3aed]/25 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#7c3aed]">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-[#7c3aed] transition-colors leading-tight">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.title && (
                          <p className="text-xs text-[#52525b] leading-tight mt-0.5">{contact.title}</p>
                        )}
                      </div>
                    </Link>
                  </td>

                  <td className="px-4 py-3.5 hidden md:table-cell">
                    {contact.company ? (
                      <Link
                        href={`/companies/${contact.company.id}`}
                        className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-white transition-colors w-fit"
                      >
                        <Building2 className="h-3 w-3 shrink-0 text-[#52525b]" />
                        <span className="text-sm">{contact.company.name}</span>
                      </Link>
                    ) : (
                      <span className="text-[#3f3f46]">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="space-y-1">
                      {contact.email && (
                        <div className="flex items-center gap-1.5 text-xs text-[#52525b]">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[180px]">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-[#52525b]">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {!contact.email && !contact.phone && <span className="text-[#3f3f46] text-xs">—</span>}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg?.dot)} />
                      <Badge variant={cfg?.variant ?? "secondary"} className="text-xs">
                        {cfg?.label ?? contact.status}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 hidden sm:table-cell text-[#52525b] text-xs">
                    {formatDate(contact.createdAt)}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-[#52525b] text-right">
          Showing {filtered.length} of {contacts.length} contacts
        </p>
      )}

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
