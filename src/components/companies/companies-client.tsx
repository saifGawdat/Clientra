"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Building2, Trash2, Pencil, Globe, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CompanyFormDialog } from "@/components/companies/company-form-dialog"
import { formatDate } from "@/lib/utils"

type Company = {
  id: string
  name: string
  website: string | null
  industry: string | null
  size: string | null
  email: string | null
  phone: string | null
  city: string | null
  country: string | null
  createdAt: Date
  _count: { contacts: number; deals: number }
}

export function CompaniesClient({ initialCompanies }: { initialCompanies: Company[] }) {
  const [companies, setCompanies] = useState(initialCompanies)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this company?")) return
    await fetch(`/api/companies/${id}`, { method: "DELETE" })
    setCompanies((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSave = (company: any) => {
    setCompanies((prev) => {
      const idx = prev.findIndex((c) => c.id === company.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], ...company }
        return next
      }
      return [{ ...company, _count: { contacts: 0, deals: 0 } }, ...prev]
    })
    setShowForm(false)
    setEditingCompany(null)
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">{companies.length} total companies</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {search ? "No companies match your search" : "No companies yet. Add your first one!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <Card key={company.id} className="hover:border-blue-200 transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/companies/${company.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {company.name}
                      </p>
                      {company.industry && (
                        <p className="text-xs text-gray-400 truncate">{company.industry}</p>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6"
                      onClick={() => { setEditingCompany(company); setShowForm(true) }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(company.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {company.website && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Globe className="h-3 w-3" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer"
                        className="hover:text-blue-600 truncate">{company.website.replace(/^https?:\/\//, "")}</a>
                    </div>
                  )}
                  {(company.city || company.country) && (
                    <p className="text-xs text-gray-500">
                      {[company.city, company.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{company._count.contacts} contacts</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{company._count.deals} deals</span>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{formatDate(company.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CompanyFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingCompany(null) }}
        onSave={handleSave}
        company={editingCompany}
      />
    </div>
  )
}
