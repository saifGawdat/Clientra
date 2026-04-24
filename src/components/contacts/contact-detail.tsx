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
import { Contact, Company, Note, CRMActivity, Deal } from "@/types/crm-types";

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
  LEAD: "bg-zinc-800 text-zinc-300 border-zinc-700",
  QUALIFIED: "bg-blue-950/50 text-blue-300 border-blue-800/50",
  PROPOSAL: "bg-amber-950/50 text-amber-300 border-amber-800/50",
  NEGOTIATION: "bg-[#7c3aed]/20 text-[#a78bfa] border-[#7c3aed]/40",
  WON: "bg-emerald-950/50 text-emerald-300 border-emerald-800/50",
  LOST: "bg-red-950/50 text-red-300 border-red-800/50",
};

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  CALL: "text-blue-400 bg-blue-950/40 border-blue-800/30",
  EMAIL: "text-[#a78bfa] bg-[#7c3aed]/20 border-[#7c3aed]/30",
  MEETING: "text-emerald-400 bg-emerald-950/40 border-emerald-800/30",
  TASK: "text-amber-400 bg-amber-950/40 border-amber-800/30",
  NOTE: "text-zinc-400 bg-zinc-900 border-zinc-800",
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
    <div className="p-8 space-y-6 bg-[#09090b] min-h-full">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <Link href="/contacts">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#52525b] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-white tracking-tight">
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
            <p className="text-[#52525b] text-sm mt-0.5">{contact.title}</p>
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
            className="text-red-400 hover:text-red-400 hover:bg-red-950/30"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Avatar + identity */}
          <div className="oled-card space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#7c3aed]/15 border border-[#7c3aed]/25 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-[#7c3aed]">
                  {contact.firstName[0]}
                  {contact.lastName[0]}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white leading-tight">
                  {contact.firstName} {contact.lastName}
                </p>
                {contact.title && (
                  <p className="text-xs text-[#52525b] mt-0.5">
                    {contact.title}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2.5 text-sm text-[#a1a1aa] hover:text-white transition-colors group"
                >
                  <Mail className="h-3.5 w-3.5 text-[#52525b] group-hover:text-[#7c3aed] shrink-0 transition-colors" />
                  <span className="truncate">{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2.5 text-sm text-[#a1a1aa] hover:text-white transition-colors group"
                >
                  <Phone className="h-3.5 w-3.5 text-[#52525b] group-hover:text-[#7c3aed] shrink-0 transition-colors" />
                  <span>{contact.phone}</span>
                </a>
              )}
              {contact.company && (
                <Link
                  href={`/companies/${contact.company.id}`}
                  className="flex items-center gap-2.5 text-sm text-[#a1a1aa] hover:text-white transition-colors group"
                >
                  <Building2 className="h-3.5 w-3.5 text-[#52525b] group-hover:text-[#7c3aed] shrink-0 transition-colors" />
                  <span>{contact.company.name}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="oled-card space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#52525b]">
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
                  <span className="text-xs text-[#52525b]">{label}</span>
                  <span className="text-xs text-[#a1a1aa] font-medium">
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
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="oled-card py-3 px-3 text-center">
                <Icon className="h-3.5 w-3.5 text-[#52525b] mx-auto mb-1" />
                <p className="text-lg font-bold font-mono text-white leading-none">
                  {value}
                </p>
                <p className="text-[10px] text-[#52525b] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div className="oled-card space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#52525b]">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#18181b] border border-[#1e1e24] text-xs text-[#a1a1aa]"
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
            </TabsList>

            {/* Deals */}
            <TabsContent value="deals" className="space-y-2">
              {(contact.deals ?? []).length === 0 ? (
                <div className="py-12 text-center text-[#52525b] text-sm">
                  No deals linked to this contact.
                </div>
              ) : (
                (contact.deals ?? []).map((deal: Deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <div className="oled-card flex items-center justify-between hover:border-[#7c3aed]/30 transition-colors cursor-pointer">
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {deal.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-[#52525b]" />
                          <span className="text-xs text-[#52525b]">
                            {formatDate(deal.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        {deal.value != null && (
                          <span className="text-sm font-mono text-[#7c3aed]">
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
                <div className="py-12 text-center text-[#52525b] text-sm">
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
                        <p className="font-medium text-sm text-white">
                          {act.subject}
                        </p>
                        {act.description && (
                          <p className="text-xs text-[#52525b] mt-0.5 truncate">
                            {act.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[#52525b]">
                          {formatDate(act.createdAt)}
                        </p>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            act.status === "COMPLETED"
                              ? "text-emerald-400"
                              : act.status === "IN_PROGRESS"
                                ? "text-amber-400"
                                : act.status === "CANCELLED"
                                  ? "text-red-400"
                                  : "text-[#52525b]",
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
                <div className="py-8 text-center text-[#52525b] text-sm">
                  No notes yet.
                </div>
              ) : (
                (contact.notes ?? []).map((note: Note) => (
                  <div key={note.id} className="oled-card">
                    <p className="text-sm text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e1e24]">
                      <span className="text-xs text-[#52525b]">
                        {formatDate(note.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[#52525b] hover:text-red-400 hover:bg-red-950/30"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
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
