"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Receipt,
  Building2,
  User as UserIcon,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/confirm-modal";
import { formatDate, cn } from "@/lib/utils";
import { Invoice, InvoiceStatus } from "@/types/crm-types";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { InvoiceFormDialog } from "./invoice-form-dialog";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { useDeleteInvoice, keys } from "@/hooks/crm-hooks";
import { useQueryClient } from "@tanstack/react-query";

const ALL_STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

export function InvoicesClient() {
  const router = useRouter();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  
  // State for filtering and pagination
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // State for Dialogs
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // 1. Data Hooks
  const { data, isLoading, error, refetch } = usePaginatedQuery<Invoice>(
    keys.invoices.lists(),
    "/api/dashboard/invoices-data",
    { page, limit, search, status: filterStatus }
  );

  const deleteInvoice = useDeleteInvoice();

  const handleDelete = async (id: string) => {
    if (!(await confirm({
      title: "Delete Invoice?",
      description: "This action cannot be undone.",
      variant: "destructive",
    }))) return;

    deleteInvoice.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.invoices.all });
      }
    });
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingInvoice(null);
    queryClient.invalidateQueries({ queryKey: keys.invoices.all });
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Error loading invoices: {(error as Error).message}</p>
        <Button onClick={() => refetch()} className="mt-4" variant="outline">Try Again</Button>
      </div>
    );
  }

  const invoices = data?.data || [];
  const meta = data?.meta;
  const contacts = data?.contacts || [];
  const companies = data?.companies || [];
  const deals = data?.deals || [];

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

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
          <Input
            placeholder="Search invoice # or client..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
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
              {s.toLowerCase()}
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
            {!isLoading && invoices.length === 0 && (
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
            {invoices.map((inv) => (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingInvoice(inv);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(inv.id);
                      }}
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

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-subtle">
            Showing <span className="text-foreground font-medium">{invoices.length}</span> of <span className="text-foreground font-medium">{meta.total}</span> invoices
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
