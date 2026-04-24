"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Building2,
  Trash2,
  Pencil,
  Globe,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyFormDialog } from "@/components/companies/company-form-dialog";
import { useConfirm } from "@/components/ui/confirm-modal";
import { formatDate } from "@/lib/utils";
import { Company as CRMCompany } from "@/types/crm-types";

export function CompaniesClient({
  initialCompanies,
}: {
  initialCompanies: CRMCompany[];
}) {
  const confirm = useConfirm();
  const [companies, setCompanies] = useState<CRMCompany[]>(initialCompanies);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CRMCompany | null>(null);

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (
      !(await confirm({
        title: "Delete Company?",
        description: "This action cannot be undone.",
        variant: "destructive",
      }))
    )
      return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = (company: CRMCompany) => {
    setCompanies((prev) => {
      const idx = prev.findIndex((c) => c.id === company.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...company };
        return next;
      }
      return [{ ...company, _count: { contacts: 0, deals: 0 } }, ...prev];
    });
    setShowForm(false);
    setEditingCompany(null);
  };

  return (
    <div className="p-8 space-y-6 bg-background min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Companies
          </h1>
          <p className="text-subtle text-sm mt-1">
            {companies.length} total companies
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-subtle">
          {search
            ? "No companies match your search"
            : "No companies yet. Add your first one!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <div key={company.id} className="oled-card group relative">
              <div className="flex items-start justify-between mb-3">
                <Link
                  href={`/companies/${company.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="h-10 w-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                      {company.name}
                    </p>
                    {company.industry && (
                      <p className="text-xs text-subtle truncate">
                        {company.industry}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-1 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setEditingCompany(company);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-400 hover:text-red-400 hover:bg-red-950/30"
                    onClick={() => handleDelete(company.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                {company.website && (
                  <div className="flex items-center gap-2 text-xs text-subtle">
                    <Globe className="h-3 w-3 shrink-0" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-muted truncate transition-colors"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                {(company.city || company.country) && (
                  <p className="text-xs text-subtle">
                    {[company.city, company.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-subtle">
                  <Users className="h-3.5 w-3.5" />
                  <span>{company._count?.contacts ?? 0} contacts</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-subtle">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{company._count?.deals ?? 0} deals</span>
                </div>
                <span className="ml-auto text-xs text-subtle">
                  {formatDate(company.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CompanyFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCompany(null);
        }}
        onSave={handleSave}
        company={editingCompany}
      />
    </div>
  );
}
