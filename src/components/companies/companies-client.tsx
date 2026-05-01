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
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyFormDialog } from "@/components/companies/company-form-dialog";
import { useConfirm } from "@/components/ui/confirm-modal";
import { formatDate } from "@/lib/utils";
import { Company as CRMCompany } from "@/types/crm-types";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";

export function CompaniesClient() {
  const confirm = useConfirm();
  
  // State for filtering and pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  // State for Dialogs
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CRMCompany | null>(null);

  // Fetch paginated data
  const { data, isLoading, error, refetch } = usePaginatedQuery<CRMCompany>(
    ["companies"],
    "/api/companies",
    { page, limit, search }
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
    refetch();
  };

  const handleSave = () => {
    refetch();
    setShowForm(false);
    setEditingCompany(null);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Error loading companies: {(error as Error).message}</p>
        <Button onClick={() => refetch()} className="mt-4" variant="outline">Try Again</Button>
      </div>
    );
  }

  const companies = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Companies
          </h1>
          <p className="text-subtle text-sm mt-1">
            Manage your organizations and accounts
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      <div className="relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {!isLoading && companies.length === 0 ? (
          <div className="text-center py-24 oled-card">
            <Building2 className="h-10 w-10 text-border mx-auto mb-3 opacity-20" />
            <p className="text-subtle">
              {search
                ? "No companies match your search"
                : "No companies yet. Add your first one!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {companies.map((company) => (
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(company.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {company.website && (
                    <div className="flex items-center gap-2 text-xs text-subtle">
                      <Globe className="h-3 w-3 shrink-0" />
                      <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
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
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-subtle">
            Showing <span className="text-foreground font-medium">{companies.length}</span> of <span className="text-foreground font-medium">{meta.total}</span> companies
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => setPage(p => p - 1)}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-xs font-medium">{page}</span>
              <span className="text-xs text-subtle">/</span>
              <span className="text-xs text-subtle">{meta.totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasMore || isLoading}
              onClick={() => setPage(p => p + 1)}
              className="h-8 px-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
