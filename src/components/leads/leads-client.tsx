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
import { formatDate } from "@/lib/utils";
import { Contact as CRMContact } from "@/types/crm-types";



const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL: "Social",
  EMAIL: "Email",
  COLD_CALL: "Cold Call",
  EVENT: "Event",
  OTHER: "Other",
};

interface LeadsClientProps {
  initialLeads: CRMContact[];
  companies: { id: string; name: string }[];
}

export function LeadsClient({ initialLeads, companies }: LeadsClientProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [leads, setLeads] = useState<CRMContact[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<CRMContact | null>(null);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.company?.name?.toLowerCase().includes(q) ||
      false
    );
  });

  const totalLeads = leads.filter((l) => l.status === "LEAD").length;
  const totalProspects = leads.filter((l) => l.status === "PROSPECT").length;

  const handleDelete = async (id: string) => {
    if (
      !(await confirm({
        title: "Delete Lead?",
        description: "This action cannot be undone.",
        variant: "destructive",
      }))
    )
      return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const handleConvert = async (id: string) => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CUSTOMER" }),
    });
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      router.refresh();
    }
  };

  const handleSave = (contact: CRMContact) => {
    setLeads((prev) => {
      if (!["LEAD", "PROSPECT"].includes(contact.status)) {
        return prev.filter((l) => l.id !== contact.id);
      }
      const idx = prev.findIndex((l) => l.id === contact.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = contact;
        return next;
      }
      return [contact, ...prev];
    });
    setShowForm(false);
    setEditingLead(null);
  };

  return (
    <div className="p-8 space-y-6 bg-[#09090b] min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Leads
          </h1>
          <p className="text-[#52525b] text-sm mt-1">
            Manage and convert your leads into customers
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Leads", value: totalLeads },
          { label: "Prospects", value: totalProspects },
          { label: "Total", value: leads.length },
        ].map((stat) => (
          <div key={stat.label} className="oled-card">
            <p className="text-[#52525b] text-xs uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-3xl font-bold font-mono text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#18181b] border-[#1e1e24] text-white placeholder:text-[#52525b]"
        />
      </div>

      <div className="border border-[#1e1e24] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e24] bg-[#18181b]">
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">
                Company
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">
                Source
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#52525b] uppercase tracking-wider text-xs">
                Created
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[#52525b]"
                >
                  {search
                    ? "No leads match your search"
                    : "No leads yet. Add your first one!"}
                </td>
              </tr>
            )}
            {filtered.map((lead: CRMContact) => (
              <tr
                key={lead.id}
                className="border-b border-[#1e1e24] hover:bg-[#18181b] transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/contacts/${lead.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#7c3aed]">
                        {lead.firstName[0]}
                        {lead.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-[#7c3aed] transition-colors">
                        {lead.firstName} {lead.lastName}
                      </p>
                      {lead.email && (
                        <p className="text-xs text-[#52525b]">{lead.email}</p>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#a1a1aa]">
                  {lead.company ? (
                    <Link
                      href={`/companies/${lead.company!.id}`}
                      className="hover:text-white transition-colors"
                    >
                      {lead.company.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-[#a1a1aa]">
                  {sourceLabels[lead.source] ?? lead.source}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      lead.status === "PROSPECT" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {lead.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[#52525b]">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-[#7c3aed] hover:text-[#7c3aed] hover:bg-[#7c3aed]/10 gap-1"
                      onClick={() => handleConvert(lead.id)}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Convert
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[#52525b] hover:text-white hover:bg-[#27272a]"
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
                      className="h-7 w-7 text-[#52525b] hover:text-red-400 hover:bg-red-950/30"
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
