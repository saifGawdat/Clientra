"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Trash2, Pencil, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog"
import { formatDate } from "@/lib/utils"

type Target = {
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

const ALL_STATUSES = ["LEAD", "PROSPECT", "CUSTOMER", "CHURNED", "INACTIVE"] as const
type ConvertStatus = (typeof ALL_STATUSES)[number]

const statusColors: Record<ConvertStatus, string> = {
  LEAD: "text-[#a1a1aa] hover:bg-[#27272a]",
  PROSPECT: "text-blue-400 hover:bg-blue-950/40",
  CUSTOMER: "text-emerald-400 hover:bg-emerald-950/40",
  CHURNED: "text-red-400 hover:bg-red-950/40",
  INACTIVE: "text-[#52525b] hover:bg-[#27272a]",
}

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL: "Social",
  EMAIL: "Email",
  COLD_CALL: "Cold Call",
  EVENT: "Event",
  OTHER: "Other",
}

interface TargetsClientProps {
  initialTargets: Target[]
  companies: { id: string; name: string }[]
}

export function TargetsClient({ initialTargets, companies }: TargetsClientProps) {
  const [targets, setTargets] = useState(initialTargets)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingTarget, setEditingTarget] = useState<Target | null>(null)
  const [convertingId, setConvertingId] = useState<string | null>(null)

  const filtered = targets.filter((t) => {
    const q = search.toLowerCase()
    return (
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.company?.name.toLowerCase().includes(q) ||
      false
    )
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this target?")) return
    await fetch(`/api/contacts/${id}`, { method: "DELETE" })
    setTargets((prev) => prev.filter((t) => t.id !== id))
  }

  const handleConvert = async (id: string, newStatus: ConvertStatus) => {
    setConvertingId(null)
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setTargets((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const handleSave = (contact: Target) => {
    setTargets((prev) => {
      if (contact.status !== "TARGET") return prev.filter((t) => t.id !== contact.id)
      const idx = prev.findIndex((t) => t.id === contact.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = contact
        return next
      }
      return [contact, ...prev]
    })
    setShowForm(false)
    setEditingTarget(null)
  }

  return (
    <div className="p-8 space-y-6 bg-[#09090b] min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Targets</h1>
          <p className="text-[#52525b] text-sm mt-1">
            People you are actively targeting — convert them when ready
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          <Plus className="h-4 w-4" />
          Add Target
        </Button>
      </div>

      <div className="oled-card inline-block">
        <p className="text-[#52525b] text-xs uppercase tracking-widest mb-2">Total Targets</p>
        <p className="text-3xl font-bold font-mono text-white">{targets.length}</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
        <Input
          placeholder="Search targets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#18181b] border-[#1e1e24] text-white placeholder:text-[#52525b]"
        />
      </div>

      <div className="border border-[#1e1e24] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e24] bg-[#18181b]">
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Name</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Company</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Source</th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">Added</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[#52525b]">
                  {search ? "No targets match your search" : "No targets yet. Add your first one!"}
                </td>
              </tr>
            )}
            {filtered.map((target) => (
              <tr key={target.id} className="border-b border-[#1e1e24] hover:bg-[#18181b] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/contacts/${target.id}`} className="flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-400">
                        {target.firstName[0]}{target.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-[#7c3aed] transition-colors">
                        {target.firstName} {target.lastName}
                      </p>
                      {target.email && <p className="text-xs text-[#52525b]">{target.email}</p>}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#a1a1aa]">
                  {target.company ? (
                    <Link href={`/companies/${target.company.id}`} className="hover:text-white transition-colors">
                      {target.company.name}
                    </Link>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-[#a1a1aa]">{sourceLabels[target.source] ?? target.source}</td>
                <td className="px-4 py-3 text-[#52525b]">{formatDate(target.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    {/* Convert dropdown */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 gap-1"
                        onClick={() => setConvertingId(convertingId === target.id ? null : target.id)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Convert
                      </Button>
                      {convertingId === target.id && (
                        <div className="absolute right-0 top-full mt-1 z-20 bg-[#18181b] border border-[#1e1e24] rounded-md shadow-xl min-w-[130px] py-1">
                          {ALL_STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleConvert(target.id, s)}
                              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${statusColors[s]}`}
                            >
                              → {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[#52525b] hover:text-white hover:bg-[#27272a]"
                      onClick={() => { setEditingTarget(target); setShowForm(true) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[#52525b] hover:text-red-400 hover:bg-red-950/30"
                      onClick={() => handleDelete(target.id)}
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

      {/* Close convert dropdown when clicking outside */}
      {convertingId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setConvertingId(null)}
        />
      )}

      <ContactFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingTarget(null) }}
        onSave={handleSave}
        contact={editingTarget}
        companies={companies}
      />
    </div>
  )
}
