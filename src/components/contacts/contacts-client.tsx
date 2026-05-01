"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Mail,
  Phone,
  Building2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { useConfirm } from "@/components/ui/confirm-modal";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Contact as CRMContact, ContactStatus } from "@/types/crm-types";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { useQuery } from "@tanstack/react-query";

const STATUS_CONFIG: Record<
  string,
  {
    variant: "default" | "secondary" | "success" | "warning" | "destructive";
    label: string;
    dot: string;
  }
> = {
  TARGET: { variant: "warning", label: "Target", dot: "bg-amber-400" },
  LEAD: { variant: "secondary", label: "Lead", dot: "bg-zinc-400" },
  PROSPECT: { variant: "default", label: "Prospect", dot: "bg-blue-400" },
  CUSTOMER: { variant: "success", label: "Customer", dot: "bg-emerald-400" },
  CHURNED: { variant: "destructive", label: "Churned", dot: "bg-red-400" },
  INACTIVE: { variant: "secondary", label: "Inactive", dot: "bg-zinc-600" },
};

const ALL_STATUSES = [
  "TARGET",
  "LEAD",
  "PROSPECT",
  "CUSTOMER",
  "CHURNED",
  "INACTIVE",
] as const;

export function ContactsClient() {
  const confirm = useConfirm();
  
  // State for filtering and pagination
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // State for Dialogs
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);

  // Fetch paginated contacts
  const { data, isLoading, error, refetch } = usePaginatedQuery<CRMContact>(
    ["contacts"],
    "/api/contacts",
    { page, limit, search, status: filterStatus }
  );

  // Fetch companies for the form (limit to 100 for now)
  const { data: companiesData } = useQuery({
    queryKey: ["companies-minimal"],
    queryFn: async () => {
      const res = await fetch("/api/companies?limit=100");
      return res.json();
    }
  });

  const handleDelete = async (id: string) => {
    if (
      !(await confirm({
        title: "Delete Contact?",
        description: "This action cannot be undone.",
        variant: "destructive",
      }))
    )
      return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    refetch();
  };

  const handleSave = () => {
    refetch();
    setShowForm(false);
    setEditingContact(null);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Error loading contacts: {(error as Error).message}</p>
        <Button onClick={() => refetch()} className="mt-4" variant="outline">Try Again</Button>
      </div>
    );
  }

  const contacts = data?.data || [];
  const meta = data?.meta;
  const companies = companiesData?.companies || [];

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Contacts
          </h1>
          <p className="text-subtle text-sm mt-1">
            Manage your people and relationships
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingContact(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setFilterStatus("");
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              !filterStatus
                ? "bg-accent text-white"
                : "bg-surface border border-border text-subtle hover:text-muted",
            )}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilterStatus(filterStatus === s ? "" : s);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                filterStatus === s
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-subtle hover:text-muted",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_CONFIG[s]?.dot)} />
              {STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        <table className="w-full text-sm min-w-[540px]">
          <thead>
            <tr className="border-b border-border bg-overlay">
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Name</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs hidden md:table-cell">Company</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs hidden lg:table-cell">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Status</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs hidden sm:table-cell">Added</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-subtle text-sm">
                    {search || filterStatus
                      ? "No contacts match your filters"
                      : "No contacts yet. Add your first one!"}
                  </p>
                </td>
              </tr>
            )}
            {contacts.map((contact: CRMContact) => {
              const cfg = STATUS_CONFIG[contact.status];
              return (
                <tr
                  key={contact.id}
                  className="hover:bg-surface transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="h-9 w-9 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent">
                          {contact.firstName[0]}
                          {contact.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-accent transition-colors leading-tight">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.title && (
                          <p className="text-xs text-subtle leading-tight mt-0.5">
                            {contact.title}
                          </p>
                        )}
                      </div>
                    </Link>
                  </td>

                  <td className="px-4 py-3.5 hidden md:table-cell">
                    {contact.company ? (
                      <Link
                        href={`/companies/${contact.company.id}`}
                        className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors w-fit"
                      >
                        <Building2 className="h-3 w-3 shrink-0 text-subtle" />
                        <span className="text-sm">{contact.company.name}</span>
                      </Link>
                    ) : (
                      <span className="text-border-hover">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="space-y-1">
                      {contact.email && (
                        <div className="flex items-center gap-1.5 text-xs text-subtle">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[180px]">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-subtle">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {!contact.email && !contact.phone && (
                        <span className="text-border-hover text-xs">—</span>
                      )}
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

                  <td className="px-4 py-3.5 hidden sm:table-cell text-subtle text-xs">
                    {formatDate(contact.createdAt)}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingContact(contact);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-400 hover:bg-red-950/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(contact.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-subtle">
            Showing <span className="text-foreground font-medium">{contacts.length}</span> of <span className="text-foreground font-medium">{meta.total}</span> contacts
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

      <ContactFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingContact(null);
        }}
        onSave={handleSave}
        contact={editingContact}
        companies={companies}
      />
    </div>
  );
}
