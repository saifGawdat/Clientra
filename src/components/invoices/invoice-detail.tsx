"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Receipt,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Ban,
  Send,
  Printer,
  ChevronRight,
  Download,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-modal";
import { formatDate, cn } from "@/lib/utils";
import { Invoice, InvoiceStatus } from "@/types/crm-types";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { InvoiceFormDialog } from "./invoice-form-dialog";

interface InvoiceDetailProps {
  invoice: Invoice;
  contacts: { id: string; firstName: string; lastName: string }[];
  companies: { id: string; name: string }[];
  deals: { id: string; title: string; value?: number | null; currency?: string; contactId?: string | null; companyId?: string | null }[];
}

export function InvoiceDetail({ invoice: initialInvoice, contacts, companies, deals }: InvoiceDetailProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [showEdit, setShowEdit] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setUpdating(true);
    const res = await fetch(`/api/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInvoice(updated);
    }
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (
      !(await confirm({
        title: "Delete Invoice?",
        description: "This action cannot be undone.",
        variant: "destructive",
      }))
    )
      return;
    await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
    router.push("/invoices");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto space-y-3 sm:space-y-4 animate-in fade-in duration-500 print:p-0 print:m-0 print:max-w-none">
      {/* Top Navigation / Breadcrumbs */}
      <div className="flex items-center justify-between print:hidden gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-subtle overflow-hidden">
          <Link href="/invoices" className="hover:text-foreground transition-colors flex items-center gap-1 shrink-0">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 w-4" />
            <span className="hidden sm:inline">Invoices</span>
          </Link>
          <ChevronRight className="h-3 w-3 opacity-30 shrink-0" />
          <span className="text-foreground font-medium truncate">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="h-8 px-2 sm:px-3 text-xs">
            <Pencil className="h-3 w-3 sm:h-3.5 w-3.5 sm:mr-1.5" /> 
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 px-2 sm:px-3 text-xs">
            <Printer className="h-3 w-3 sm:h-3.5 w-3.5 sm:mr-1.5" /> 
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDelete}
            className="h-8 px-2 sm:px-3 text-xs text-red-400 hover:text-red-400 hover:bg-red-950/20"
          >
            <Trash2 className="h-3 w-3 sm:h-3.5 w-3.5 sm:mr-1.5" /> 
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 print:block">
        {/* Main Invoice Document View */}
        <div className="space-y-4 print:w-full print:p-0">
          <div className="oled-card p-0 overflow-hidden border-border/60 print:border-none print:shadow-none print:bg-white print:text-black">
            {/* Invoice Header */}
            <div className="p-4 sm:p-5 border-b border-border bg-overlay/30 flex flex-col sm:flex-row justify-between items-start gap-3 print:bg-transparent print:border-zinc-200 print:flex-row">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center print:bg-zinc-100">
                  <Receipt className="h-4 w-4 text-white print:text-black" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tighter text-foreground print:text-black">INVOICE</h2>
                  <p className="text-[10px] font-mono text-subtle print:text-zinc-500">{invoice.invoiceNumber}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-subtle print:text-zinc-400">Amount Due</p>
                <p className="text-xl sm:text-2xl font-black tracking-tighter text-emerald-400 print:text-black">
                  ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="print:hidden mt-1">
                  <InvoiceStatusBadge status={invoice.status} className="sm:justify-end" />
                </div>
              </div>
            </div>

            {/* Bill To / From */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 border-b border-border bg-surface/10 print:bg-transparent print:border-zinc-200 print:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-subtle/70 print:text-zinc-400">Billed To</p>
                {invoice.contact ? (
                  <>
                    <p className="font-bold text-xs sm:text-sm text-foreground print:text-black">{invoice.contact.firstName} {invoice.contact.lastName}</p>
                    {invoice.company && <p className="text-[10px] text-subtle print:text-zinc-600">{invoice.company.name}</p>}
                  </>
                ) : invoice.company ? (
                  <p className="font-bold text-xs sm:text-sm text-foreground print:text-black">{invoice.company.name}</p>
                ) : (
                  <p className="text-[10px] italic text-subtle print:text-zinc-400">No client specified</p>
                )}
              </div>
              <div className="sm:text-right space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-subtle/70 print:text-zinc-400">Invoice Details</p>
                <div className="space-y-0.5 text-[10px] sm:text-xs">
                  <div className="flex sm:justify-end gap-2">
                    <span className="text-subtle print:text-zinc-500">Issued:</span>
                    <span className="text-foreground font-medium print:text-black">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex sm:justify-end gap-2">
                    <span className="text-subtle print:text-zinc-500">Due:</span>
                    <span className="text-foreground font-medium print:text-black">{formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] sm:text-xs min-w-[340px] sm:min-w-0">
                <thead>
                  <tr className="bg-surface/30 text-[9px] font-bold uppercase tracking-widest text-subtle border-b border-border print:bg-zinc-50 print:border-zinc-200 print:text-zinc-600">
                    <th className="text-left px-4 sm:px-6 py-2 w-8">#</th>
                    <th className="text-left px-3 py-2">Description / Service</th>
                    <th className="text-right px-4 sm:px-6 py-2">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-zinc-100">
                  {invoice.items?.map((item, idx) => (
                    <tr key={item.id} className="group hover:bg-surface/20 transition-colors print:bg-white">
                      <td className="px-4 sm:px-6 py-2.5 text-subtle font-mono print:text-zinc-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 text-foreground font-medium">{item.service}</td>
                      <td className="px-4 sm:px-6 py-2.5 text-right text-foreground font-mono">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-overlay/20 print:border-zinc-200 print:bg-zinc-50">
                    <td colSpan={2} className="px-4 sm:px-6 py-3 text-right text-[9px] sm:text-[10px] font-bold text-subtle uppercase tracking-wider print:text-zinc-500">Total</td>
                    <td className="px-4 sm:px-6 py-3 text-right text-sm sm:text-lg font-black text-emerald-400 font-mono print:text-black">
                      ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 bg-overlay/40 text-[9px] text-subtle/60 uppercase tracking-widest print:bg-transparent print:text-zinc-400">
              Payment is expected within 30 days. Thank you for your business.
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-3 print:hidden">
          {/* Status Management */}
          <div className="oled-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-subtle">Update Status</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { s: "SENT", icon: Send, label: "Mark as Sent", color: "hover:bg-blue-500/10 hover:text-blue-400" },
                { s: "PAID", icon: CheckCircle2, label: "Mark as Paid", color: "hover:bg-emerald-500/10 hover:text-emerald-400" },
                { s: "OVERDUE", icon: Clock, label: "Mark as Overdue", color: "hover:bg-red-500/10 hover:text-red-400" },
                { s: "CANCELLED", icon: Ban, label: "Cancel Invoice", color: "hover:bg-zinc-500/10 hover:text-zinc-400" },
              ].map((item) => (
                <Button
                  key={item.s}
                  variant="outline"
                  size="sm"
                  disabled={invoice.status === item.s || updating}
                  onClick={() => handleStatusChange(item.s as InvoiceStatus)}
                  className={cn(
                    "justify-start h-9 transition-all",
                    invoice.status === item.s ? "bg-accent/10 border-accent/30 text-accent opacity-50" : item.color
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="oled-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-subtle">Quick Info</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-subtle">Linked Deal</span>
                {invoice.dealId ? (
                  <Link href={`/deals/${invoice.dealId}`} className="text-accent hover:underline font-medium text-xs flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> View Deal
                  </Link>
                ) : (
                  <span className="text-subtle/50 italic">None</span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-subtle">Linked Contact</span>
                {invoice.contact ? (
                  <Link href={`/contacts/${invoice.contact.id}`} className="text-accent hover:underline font-medium text-xs flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> {invoice.contact.firstName}
                  </Link>
                ) : (
                  <span className="text-subtle/50 italic">None</span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-subtle">Last Updated</span>
                <span className="text-foreground font-medium">{formatDate(invoice.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Download / Print */}
          <div className="oled-card p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-accent" />
              <p className="text-xs font-bold text-foreground">Download PDF</p>
            </div>
            <p className="text-[10px] text-subtle">Generates a clean PDF via your browser's print dialog.</p>
            <Button size="sm" className="w-full h-8 bg-accent hover:bg-accent/90 text-white text-xs" onClick={handlePrint}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download / Print
            </Button>
          </div>
        </div>
      </div>

      <InvoiceFormDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(updated) => {
          setInvoice(updated);
          setShowEdit(false);
        }}
        invoice={invoice}
        contacts={contacts}
        companies={companies}
        deals={deals}
      />
    </div>
  );
}
