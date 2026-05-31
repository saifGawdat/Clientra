"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, UserCheck, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { useConfirm } from "@/components/ui/confirm-modal";
import { formatDate, cn } from "@/lib/utils";
import { Contact as CRMContact } from "@/types/crm-types";
import { useContacts, useUpdateContact, useDeleteContact } from "@/hooks/crm-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanies } from "@/hooks/crm-hooks";

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL: "Social",
  EMAIL: "Email",
  COLD_CALL: "Cold Call",
  EVENT: "Event",
  OTHER: "Other",
};

export function LeadsClient() {
  const router = useRouter();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  // 1. Data Hooks — fully client-driven, no server props needed
  const { data: contactsData } = useContacts();
  const { data: companiesData } = useCompanies();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const leads = Array.isArray(contactsData) ? contactsData : contactsData?.data || [];
  const companies = Array.isArray(companiesData) ? companiesData : companiesData?.data || [];

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<CRMContact | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filtered = leads.filter((l: CRMContact) => {
    const q = search.toLowerCase();
    return (
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.company?.name?.toLowerCase().includes(q) ||
      false
    );
  });

  const totalLeads = leads.filter((l: CRMContact) => l.status === "LEAD").length;
  const totalProspects = leads.filter((l: CRMContact) => l.status === "PROSPECT").length;

  const handleDelete = async (id: string) => {
    if (
      !(await confirm({
        title: "Delete Lead?",
        description: "This action cannot be undone.",
        variant: "destructive",
      }))
    )
      return;

    deleteContact.mutate(id, {
      onSuccess: () => {
        setToast({ message: "Lead deleted successfully", type: "success" });
        setTimeout(() => setToast(null), 3000);
      }
    });
  };

  const handleConvert = (id: string) => {
    updateContact.mutate(
      { id, data: { status: "CUSTOMER" } },
      {
        onSuccess: () => {
          setToast({ 
            message: "Lead converted to Customer", 
            type: "success" 
          });
          setTimeout(() => setToast(null), 3000);
          router.refresh();
        },
        onError: () => {
          setToast({ message: "Failed to convert lead", type: "error" });
          setTimeout(() => setToast(null), 3000);
        }
      }
    );
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingLead(null);
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Leads
          </h1>
          <p className="text-subtle text-sm mt-1">
            Manage and convert your leads into customers
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Leads", value: totalLeads },
          { label: "Prospects", value: totalProspects },
          { label: "Total", value: leads.length },
        ].map((stat) => (
          <div key={stat.label} className="oled-card">
            <p className="text-subtle text-xs uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-3xl font-bold font-mono text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[540px]">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Name</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Company</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Source</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Status</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-subtle">
                  {search
                    ? "No leads match your search"
                    : "No leads yet. Add your first one!"}
                </td>
              </tr>
            )}
            {filtered.map((lead: CRMContact) => (
              <tr
                key={lead.id}
                className="border-b border-border hover:bg-surface transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/contacts/${lead.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-accent">
                        {lead.firstName[0]}
                        {lead.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {lead.firstName} {lead.lastName}
                      </p>
                      {lead.email && (
                        <p className="text-xs text-subtle">{lead.email}</p>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  {lead.company ? (
                    <Link
                      href={`/companies/${lead.company!.id}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {lead.company.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  {sourceLabels[lead.source] ?? lead.source}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={lead.status === "PROSPECT" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {lead.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-subtle">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-accent hover:text-accent hover:bg-accent/10 gap-1"
                      disabled={updateContact.isPending && updateContact.variables?.id === lead.id}
                      onClick={() => handleConvert(lead.id)}
                    >
                      <UserCheck className={cn(
                        "h-3.5 w-3.5",
                        updateContact.isPending && updateContact.variables?.id === lead.id && "animate-spin"
                      )} />
                      {updateContact.isPending && updateContact.variables?.id === lead.id ? "Converting..." : "Convert"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-subtle hover:text-foreground hover:bg-surface-raised"
                      onClick={() => {
                        setEditingLead(lead);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-subtle hover:text-red-400 hover:bg-red-950/30"
                      onClick={() => handleDelete(lead.id)}
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

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={cn(
            "px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[300px]",
            toast.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              toast.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20"
            )}>
              <UserCheck className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <ContactFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingLead(null);
        }}
        onSave={handleSave}
        contact={editingLead}
        companies={companies}
      />
    </div>
  );
}
