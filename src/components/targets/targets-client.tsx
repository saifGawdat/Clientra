"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TargetFormDialog } from "./target-form-dialog";
import { useConfirm } from "@/components/ui/confirm-modal";
import { formatDate, cn } from "@/lib/utils";
import { Contact as CRMContact } from "@/types/crm-types";
import { useContacts, useUpdateContact, useDeleteContact } from "@/hooks/crm-hooks";
import { useQueryClient } from "@tanstack/react-query";

const ALL_STATUSES = [
  "TARGET",
  "LEAD",
  "PROSPECT",
] as const;
type ConvertStatus = (typeof ALL_STATUSES)[number];

const statusColors: Record<string, string> = {
  TARGET: "text-amber-400 hover:bg-amber-950/30",
  LEAD: "text-muted hover:bg-surface-raised",
  PROSPECT: "text-blue-400 hover:bg-blue-950/40",
};

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL: "Social",
  EMAIL: "Email",
  COLD_CALL: "Cold Call",
  EVENT: "Event",
  OTHER: "Other",
};

interface TargetsClientProps {
  initialTargets: CRMContact[];
  companies: { id: string; name: string }[];
}

export function TargetsClient({
  initialTargets,
  companies,
}: TargetsClientProps) {
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  
  // 1. Data Hooks
  const { data: contactsData } = useContacts(initialTargets);
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const contacts = Array.isArray(contactsData) ? contactsData : (contactsData as any)?.data || [];

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<CRMContact | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // 2. Filter logic (Targets page shows TARGET, LEAD, PROSPECT)
  const targets = contacts.filter((c: CRMContact) => ["TARGET", "LEAD", "PROSPECT"].includes(c.status));
  
  const filtered = targets.filter((t: CRMContact) => {
    const q = search.toLowerCase();
    return (
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.company?.name?.toLowerCase().includes(q) ||
      false
    );
  });

  const handleDelete = async (id: string) => {
    if (!(await confirm({
      title: "Delete Target?",
      description: "This action cannot be undone.",
      variant: "destructive",
    }))) return;

    deleteContact.mutate(id, {
      onSuccess: () => {
        setToast({ message: "Target deleted successfully", type: "success" });
        setTimeout(() => setToast(null), 3000);
      }
    });
  };

  const handleConvert = (contact: CRMContact) => {
    updateContact.mutate(
      { id: contact.id, data: { status: "CUSTOMER" } },
      {
        onSuccess: () => {
          setToast({ 
            message: `${contact.firstName} ${contact.lastName} converted to Customer`, 
            type: "success" 
          });
          setTimeout(() => setToast(null), 3000);
        },
        onError: () => {
          setToast({ message: "Failed to convert target", type: "error" });
          setTimeout(() => setToast(null), 3000);
        }
      }
    );
  };

  const handleSave = () => {
    // With TanStack Query, the child dialog handles the fetch.
    // We just need to close the form and invalidate.
    setShowForm(false);
    setEditingTarget(null);
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Targets
          </h1>
          <p className="text-subtle text-sm mt-1">
            People you are actively targeting — convert them when ready
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Target
        </Button>
      </div>

      <div className="oled-card inline-block">
        <p className="text-subtle text-xs uppercase tracking-widest mb-2">
          Total Targets
        </p>
        <p className="text-3xl font-bold font-mono text-foreground">
          {targets.length}
        </p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
        <Input
          placeholder="Search targets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Name</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Company</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Status</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Added</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-subtle">
                  {search
                    ? "No targets match your search"
                    : "No targets yet. Add your first one!"}
                </td>
              </tr>
            )}
            {filtered.map((target: CRMContact) => (
              <tr
                key={target.id}
                className="border-b border-border hover:bg-surface transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/contacts/${target.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-400">
                        {target.firstName[0]}
                        {target.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {target.firstName} {target.lastName}
                      </p>
                      {target.email && (
                        <p className="text-xs text-subtle">{target.email}</p>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  {target.company ? (
                    <Link
                      href={`/companies/${target.company!.id}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {target.company.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    target.status === 'TARGET' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' :
                    target.status === 'LEAD' ? 'text-zinc-400 border-zinc-400/30 bg-zinc-400/10' :
                    'text-blue-400 border-blue-400/30 bg-blue-400/10'
                  }`}>
                    {target.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-subtle">
                  {formatDate(target.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 gap-1"
                      disabled={updateContact.isPending && updateContact.variables?.id === target.id}
                      onClick={() => handleConvert(target)}
                    >
                      <RefreshCw className={cn(
                        "h-3.5 w-3.5", 
                        updateContact.isPending && updateContact.variables?.id === target.id && "animate-spin"
                      )} />
                      {updateContact.isPending && updateContact.variables?.id === target.id ? "Converting..." : "Convert"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-subtle hover:text-foreground hover:bg-surface-raised"
                      onClick={() => {
                        setEditingTarget(target);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-subtle hover:text-red-400 hover:bg-red-950/30"
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
              <RefreshCw className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <TargetFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTarget(null);
        }}
        onSave={handleSave}
        contact={editingTarget}
        companies={companies}
      />
    </div>
  );
}
