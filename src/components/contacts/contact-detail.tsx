"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  Tag,
  Send,
  Calendar,
  TrendingUp,
  MessageSquare,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { useConfirm } from "@/components/ui/confirm-modal";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Contact, Note, CRMActivity, Deal, Invoice } from "@/types/crm-types";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Receipt } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "purple"; dot: string; label: string }
> = {
  TARGET: { variant: "warning", dot: "bg-amber-400", label: "Target" },
  LEAD: { variant: "secondary", dot: "bg-zinc-400", label: "Lead" },
  PROSPECT: { variant: "default", dot: "bg-blue-400", label: "Prospect" },
  CUSTOMER: { variant: "success", dot: "bg-emerald-400", label: "Customer" },
  CHURNED: { variant: "destructive", dot: "bg-red-400", label: "Churned" },
  INACTIVE: { variant: "secondary", dot: "bg-zinc-600", label: "Inactive" },
};

const DEAL_STAGE_COLORS: Record<string, string> = {
  LEAD: "bg-surface-raised text-muted border-border-hover",
  QUALIFIED: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  PROPOSAL: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  NEGOTIATION: "bg-accent/15 text-accent-light border-accent/30",
  WON: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  LOST: "bg-red-500/15 text-red-500 border-red-500/30",
};

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  CALL: "text-blue-500 bg-blue-500/15 border-blue-500/30",
  EMAIL: "text-accent-light bg-accent/15 border-accent/30",
  MEETING: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
  TASK: "text-amber-500 bg-amber-500/15 border-amber-500/30",
  NOTE: "text-muted bg-surface border-border",
};

export function ContactDetail({
  contact: initialContact,
  companies,
}: {
  contact: Contact;
  companies: { id: string; name: string }[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [contact, setContact] = useState<Contact>(initialContact);
  const [showEdit, setShowEdit] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setSavingNote(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: noteContent.trim(),
        contactId: contact.id,
      }),
    });
    if (res.ok) {
      const note = await res.json();
      setContact((prev) => ({ ...prev, notes: [note, ...(prev.notes ?? [])] }));
      setNoteContent("");
    }
    setSavingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    setContact((prev) => ({
      ...prev,
      notes: (prev.notes ?? []).filter((n: Note) => n.id !== noteId),
    }));
  };

  const handleDelete = async () => {
    if (
      !(await confirm({
        title: "Delete Contact?",
        description: "This action cannot be undone.",
        variant: "destructive",
      }))
    )
      return;
    await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    router.push("/contacts");
  };

  const statusCfg = STATUS_CONFIG[contact.status] ?? STATUS_CONFIG.LEAD;

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <Link href="/contacts">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-subtle hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {contact.firstName} {contact.lastName}
            </h1>
            <div className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
              <Badge variant={statusCfg.variant} className="text-xs">
                {statusCfg.label}
              </Badge>
            </div>
          </div>
          {contact.title && (
            <p className="text-subtle text-sm mt-0.5">{contact.title}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 sm:gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Avatar + identity */}
          <div className="oled-card space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-accent">
                  {contact.firstName[0]}
                  {contact.lastName[0]}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground leading-tight">
                  {contact.firstName} {contact.lastName}
                </p>
                {contact.title && (
                  <p className="text-xs text-subtle mt-0.5">
                    {contact.title}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2.5 text-sm text-muted hover:text-foreground transition-colors group"
                >
                  <Mail className="h-3.5 w-3.5 text-subtle group-hover:text-accent shrink-0 transition-colors" />
                  <span className="truncate">{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2.5 text-sm text-muted hover:text-foreground transition-colors group"
                >
                  <Phone className="h-3.5 w-3.5 text-subtle group-hover:text-accent shrink-0 transition-colors" />
                  <span>{contact.phone}</span>
                </a>
              )}
              {contact.company && (
                <Link
                  href={`/companies/${contact.company.id}`}
                  className="flex items-center gap-2.5 text-sm text-muted hover:text-foreground transition-colors group"
                >
                  <Building2 className="h-3.5 w-3.5 text-subtle group-hover:text-accent shrink-0 transition-colors" />
                  <span>{contact.company.name}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="oled-card space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-subtle">
              Details
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Status", value: statusCfg.label },
                { label: "Source", value: contact.source },
                { label: "Added", value: formatDate(contact.createdAt) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-xs text-subtle">{label}</span>
                  <span className="text-xs text-muted font-medium">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: TrendingUp, label: "Deals", value: (contact.deals ?? []).length },
              {
                icon: Activity,
                label: "Activities",
                value: (contact.activities ?? []).length,
              },
              {
                icon: MessageSquare,
                label: "Notes",
                value: (contact.notes ?? []).length,
              },
              {
                icon: Receipt,
                label: "Invoices",
                value: (contact.invoices ?? []).length,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="oled-card py-3 px-3 text-center">
                <Icon className="h-3.5 w-3.5 text-subtle mx-auto mb-1" />
                <p className="text-lg font-bold font-mono text-foreground leading-none">
                  {value}
                </p>
                <p className="text-[10px] text-subtle mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div className="oled-card space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-subtle">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-xs text-muted"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div>
          <Tabs defaultValue="deals">
            <TabsList className="mb-4">
              <TabsTrigger value="deals">
                Deals ({(contact.deals ?? []).length})
              </TabsTrigger>
              <TabsTrigger value="activities">
                Activities ({(contact.activities ?? []).length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes ({(contact.notes ?? []).length})
              </TabsTrigger>
              <TabsTrigger value="invoices">
                Invoices ({(contact.invoices ?? []).length})
              </TabsTrigger>
            </TabsList>

            {/* Deals */}
            <TabsContent value="deals" className="space-y-2">
              {(contact.deals ?? []).length === 0 ? (
                <div className="py-12 text-center text-subtle text-sm">
                  No deals linked to this contact.
                </div>
              ) : (
                (contact.deals ?? []).map((deal: Deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <div className="oled-card flex items-center justify-between hover:border-accent/30 transition-colors cursor-pointer">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {deal.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-subtle" />
                          <span className="text-xs text-subtle">
                            {formatDate(deal.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        {deal.value != null && (
                          <span className="text-sm font-mono text-accent">
                            {formatCurrency(deal.value, deal.currency)}
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                            DEAL_STAGE_COLORS[deal.stage] ??
                              DEAL_STAGE_COLORS.LEAD,
                          )}
                        >
                          {deal.stage}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </TabsContent>

            {/* Activities */}
            <TabsContent value="activities" className="space-y-2">
              {(contact.activities ?? []).length === 0 ? (
                <div className="py-12 text-center text-subtle text-sm">
                  No activities logged for this contact.
                </div>
              ) : (
                (contact.activities ?? []).map((act: CRMActivity) => {
                  const colorClass =
                    ACTIVITY_TYPE_COLORS[act.type] ?? ACTIVITY_TYPE_COLORS.NOTE;
                  return (
                    <div
                      key={act.id}
                      className="oled-card flex items-start gap-4"
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold",
                          colorClass,
                        )}
                      >
                        {act.type[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {act.subject}
                        </p>
                        {act.description && (
                          <p className="text-xs text-subtle mt-0.5 truncate">
                            {act.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-subtle">
                          {formatDate(act.createdAt)}
                        </p>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            act.status === "COMPLETED"
                              ? "text-emerald-500"
                              : act.status === "IN_PROGRESS"
                                ? "text-amber-500"
                                : act.status === "CANCELLED"
                                  ? "text-red-500"
                                  : "text-subtle",
                          )}
                        >
                          {act.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes" className="space-y-3">
              <div className="oled-card space-y-3">
                <Textarea
                  placeholder="Write a note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={savingNote || !noteContent.trim()}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {savingNote ? "Saving..." : "Add note"}
                  </Button>
                </div>
              </div>

              {(contact.notes ?? []).length === 0 ? (
                <div className="py-8 text-center text-subtle text-sm">
                  No notes yet.
                </div>
              ) : (
                (contact.notes ?? []).map((note: Note) => (
                  <div key={note.id} className="oled-card">
                    <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-subtle">
                        {formatDate(note.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-subtle hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Invoices */}
            <TabsContent value="invoices" className="space-y-2">
              {(contact.invoices ?? []).length === 0 ? (
                <div className="py-12 text-center text-subtle text-sm">
                  No invoices issued to this contact.
                </div>
              ) : (
                (contact.invoices ?? []).map((inv: Invoice) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`}>
                    <div className="oled-card flex items-center justify-between hover:border-accent/30 transition-colors cursor-pointer">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-medium text-foreground">
                          {inv.invoiceNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-subtle" />
                          <span className="text-xs text-subtle">
                            Due {formatDate(inv.dueDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <span className="text-sm font-mono font-bold text-emerald-400">
                          ${inv.amount.toLocaleString()}
                        </span>
                        <InvoiceStatusBadge status={inv.status} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ContactFormDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(updated: Partial<Contact>) => {
          setContact((prev: Contact) => ({ ...prev, ...updated }));
          setShowEdit(false);
        }}
        contact={contact}
        companies={companies}
      />
    </div>
  );
}
