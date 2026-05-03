"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building2,
  Send,
  Receipt,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyFormDialog } from "@/components/companies/company-form-dialog";
import { useConfirm } from "@/components/ui/confirm-modal";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Company, Contact, Deal, Note, Invoice } from "@/types/crm-types";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

const dealStageVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "purple"> = {
  LEAD: "secondary",
  QUALIFIED: "default",
  PROPOSAL: "warning",
  NEGOTIATION: "purple",
  WON: "success",
  LOST: "destructive",
};
const contactStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "purple"> = {
  LEAD: "secondary",
  PROSPECT: "default",
  CUSTOMER: "success",
  CHURNED: "destructive",
  INACTIVE: "secondary",
};

type FullCompany = Company & { contacts: Contact[]; deals: Deal[]; notes: Note[]; invoices: Invoice[] };

export function CompanyDetail({ company: initialCompany }: { company: FullCompany }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [company, setCompany] = useState<FullCompany>(initialCompany);
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
        companyId: company.id,
      }),
    });
    if (res.ok) {
      const note = await res.json();
      setCompany((prev) => ({
        ...prev,
        notes: [note, ...(prev.notes ?? [])],
      }));
      setNoteContent("");
    }
    setSavingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    setCompany((prev) => ({
      ...prev,
      notes: prev.notes.filter((n: Note) => n.id !== noteId),
    }));
  };

  const handleDelete = async () => {
    if (
      !(await confirm({
        title: "Delete Company?",
        description: "This action cannot be undone.",
        variant: "destructive",
      }))
    )
      return;
    await fetch(`/api/companies/${company.id}`, { method: "DELETE" });
    router.push("/companies");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/companies">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
          {company.industry && (
            <p className="text-subtle text-sm">{company.industry}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{company.name}</p>
                {company.size && (
                  <p className="text-xs text-muted">{company.size}</p>
                )}
              </div>
            </div>

            {company.website && (
              <div className="flex items-center gap-2 text-sm text-subtle">
                <Globe className="h-3.5 w-3.5 text-muted" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent truncate"
                >
                  {company.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-2 text-sm text-subtle">
                <Mail className="h-3.5 w-3.5 text-muted" />
                <a
                  href={`mailto:${company.email}`}
                  className="hover:text-accent"
                >
                  {company.email}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-sm text-subtle">
                <Phone className="h-3.5 w-3.5 text-muted" />
                <span>{company.phone}</span>
              </div>
            )}
            {(company.city || company.country) && (
              <div className="flex items-center gap-2 text-sm text-subtle">
                <MapPin className="h-3.5 w-3.5 text-muted" />
                <span>
                  {[company.city, company.country].filter(Boolean).join(", ")}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-border space-y-2 text-xs text-subtle">
              <div className="flex justify-between">
                <span>Contacts</span>
                <span className="font-medium text-foreground">
                  {company.contacts.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Invoices</span>
                <span className="font-medium text-foreground">
                  {company.invoices?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Created</span>
                <span className="font-medium text-foreground">
                  {formatDate(company.createdAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="contacts">
            <TabsList>
              <TabsTrigger value="contacts">
                Contacts ({company.contacts.length})
              </TabsTrigger>
              <TabsTrigger value="deals">
                Deals ({company.deals.length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes ({(company.notes ?? []).length})
              </TabsTrigger>
              <TabsTrigger value="invoices">
                Invoices ({(company.invoices ?? []).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="mt-4 space-y-2">
              {company.contacts.length === 0 && (
                <p className="text-sm text-muted py-4">
                  No contacts for this company.
                </p>
              )}
              {company.contacts.map((contact: Contact) => (
                <Link key={contact.id} href={`/contacts/${contact.id}`}>
                  <Card className="hover:border-blue-200 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-700">
                            {contact.firstName[0]}
                            {contact.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-xs text-muted">
                            {contact.title ?? contact.email ?? "—"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={contactStatusVariant[contact.status]}>
                        {contact.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="deals" className="mt-4 space-y-2">
              {company.deals.length === 0 && (
                <p className="text-sm text-muted py-4">
                  No deals for this company.
                </p>
              )}
              {company.deals.map((deal: Deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <Card className="hover:border-blue-200 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {deal.title}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDate(deal.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {deal.value && (
                          <span className="text-sm font-medium">
                            {formatCurrency(deal.value)}
                          </span>
                        )}
                        <Badge variant={dealStageVariant[deal.stage]}>
                          {deal.stage}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-3">
              <Card>
                <CardContent className="p-3 space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
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
                </CardContent>
              </Card>
              {(company.notes ?? []).length === 0 && (
                <p className="text-sm text-muted py-2">No notes yet.</p>
              )}
              {(company.notes ?? []).map((note: Note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <p className="text-sm text-subtle whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted">
                        {formatDate(note.createdAt)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="invoices" className="mt-4 space-y-2">
              {(company.invoices ?? []).length === 0 && (
                <p className="text-sm text-muted py-4">
                  No invoices for this company.
                </p>
              )}
              {(company.invoices ?? []).map((inv: Invoice) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`}>
                  <Card className="hover:border-accent/30 transition-colors cursor-pointer group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-xs font-medium text-foreground">
                          {inv.invoiceNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted" />
                          <span className="text-xs text-muted">
                            Due {formatDate(inv.dueDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-bold text-emerald-400">
                          ${inv.amount.toLocaleString()}
                        </span>
                        <InvoiceStatusBadge status={inv.status} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CompanyFormDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(updated: Partial<Company>) => {
          setCompany({ ...company, ...updated });
          setShowEdit(false);
        }}
        company={company}
      />
    </div>
  );
}
