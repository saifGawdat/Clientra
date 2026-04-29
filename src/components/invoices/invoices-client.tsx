"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Receipt,
  Building2,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/confirm-modal";
import { formatDate, cn } from "@/lib/utils";
import { Invoice, InvoiceStatus } from "@/types/crm-types";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { InvoiceFormDialog } from "./invoice-form-dialog";

const ALL_STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

interface InvoicesClientProps {
  initialInvoices: Invoice[];
  contacts: { id: string; firstName: string; lastName: string; companyId?: string | null }[];
  companies: { id: string; name: string }[];
  deals: { id: string; title: string; value?: number | null; currency?: string; contactId?: string | null; companyId?: string | null }[];
}

export function InvoicesClient({
  initialInvoices,
  contacts,
  companies,
  deals
}: InvoicesClientProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.contact?.firstName?.toLowerCase().includes(q) ||
      inv.contact?.lastName?.toLowerCase().includes(q) ||
      inv.company?.name?.toLowerCase().includes(q) ||
      false;
    const matchesStatus = !filterStatus || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    overdue: invoices.filter((i) => i.status === "OVERDUE").length,
    totalRevenue: invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.amount, 0),
  };

  const handleDelete = async (id: string) => {
    if (
      !(await confirm({
        title: "Delete Invoice?",
        description: "This action cannot be undone.",
        variant: "destructive",
      }))
    )
      return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = (invoice: Invoice) => {
    setInvoices((prev) => {
      const idx = prev.findIndex((i) => i.id === invoice.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = invoice;
        return next;
      }
      return [invoice, ...prev];
    });
    setShowForm(false);
    setEditingInvoice(null);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Invoices
          </h1>
          <p className="text-subtle text-sm mt-1">
            Track revenue and billing history
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingInvoice(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Invoices", value: stats.total, color: "text-foreground" },
          { label: "Paid", value: stats.paid, color: "text-emerald-400" },
          { label: "Overdue", value: stats.overdue, color: "text-red-400" },
          { 
            label: "Total Revenue", 
            value: `$${stats.totalRevenue.toLocaleString()}`, 
            color: "text-emerald-400 font-mono" 
          },
        ].map((s) => (
          <div key={s.label} className="oled-card py-4">
            <p className="text-subtle text-xs uppercase tracking-widest mb-1">
              {s.label}
            </p>
            <p className={cn("text-2xl font-bold", s.color)}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
          <Input
            placeholder="Search invoice # or client..."
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
                ? "bg-accent text-white"
                : "bg-surface border border-border text-subtle hover:text-muted",
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
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-subtle hover:text-muted",
              )}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-overlay">
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Invoice #</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Client</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Status</th>
              <th className="text-left px-4 py-3 font-medium text-subtle uppercase tracking-wider text-xs">Due Date</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <Receipt className="h-10 w-10 text-border mx-auto mb-3 opacity-20" />
                  <p className="text-subtle text-sm">
                    {search || filterStatus
                      ? "No invoices match your filters"
                      : "No invoices yet. Create your first one!"}
                  </p>
                </td>
              </tr>
            )}
            {filtered.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-surface transition-colors group cursor-pointer"
                onClick={() => router.push(`/invoices/${inv.id}`)}
              >
                <td className="px-4 py-3.5 font-mono text-xs font-medium text-foreground">
                  {inv.invoiceNumber}
                </td>

                <td className="px-4 py-3.5">
                  <div className="space-y-1">
                    {inv.contact ? (
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <UserIcon className="h-3 w-3 text-subtle" />
                        <span>{inv.contact.firstName} {inv.contact.lastName}</span>
                      </div>
                    ) : inv.company ? (
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Building2 className="h-3 w-3 text-subtle" />
                        <span>{inv.company.name}</span>
                      </div>
                    ) : (
                      <span className="text-subtle">No client</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                  ${inv.amount.toLocaleString()}
                </td>

                <td className="px-4 py-3.5">
                  <InvoiceStatusBadge status={inv.status} />
                </td>

                <td className="px-4 py-3.5 text-subtle text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {formatDate(inv.dueDate)}
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingInvoice(inv);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-400 hover:bg-red-950/30"
                      onClick={() => handleDelete(inv.id)}
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

      <InvoiceFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingInvoice(null);
        }}
        onSave={handleSave}
        invoice={editingInvoice}
        contacts={contacts}
        companies={companies}
        deals={deals}
      />
    </div>
  );
}
