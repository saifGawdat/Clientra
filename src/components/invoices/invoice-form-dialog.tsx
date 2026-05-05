"use client"

import { useEffect, useState } from "react"
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Plus, 
  Trash2, 
  Receipt, 
  Calendar, 
  User as UserIcon, 
  Building2, 
  Briefcase,
  AlertCircle,
  FileText
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { invoiceSchema, type InvoiceInput } from "@/lib/validations"
import { Invoice } from "@/types/crm-types"
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/crm-hooks"


interface InvoiceFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (invoice: Invoice) => void
  invoice?: Invoice | null
  contacts: { id: string; firstName: string; lastName: string; companyId?: string | null }[]
  companies: { id: string; name: string }[]
  deals: { id: string; title: string; value?: number | null; currency?: string; contactId?: string | null; companyId?: string | null }[]
}

export function InvoiceFormDialog({ 
  open, 
  onClose, 
  onSave, 
  invoice, 
  contacts, 
  companies,
  deals
}: InvoiceFormDialogProps) {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const [today] = useState(() => new Date().toISOString().split('T')[0])
  const [defaultDueDate] = useState(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [defaultInvoiceNumber] = useState(() => `INV-${Math.floor(1000 + Math.random() * 9000)}`)

  const { register, handleSubmit, control, reset, setValue, getValues, formState: { errors } } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      status: "DRAFT",
      amount: 0,
      issueDate: today,
      dueDate: defaultDueDate,
      items: [{ service: "", price: 0 }],
      invoiceNumber: defaultInvoiceNumber,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const items = useWatch({ control, name: "items" }) || []
  const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

  const selectedCompanyId = useWatch({ control, name: "companyId" })
  const contactList = Array.isArray(contacts) ? contacts : [];
  const filteredContacts = selectedCompanyId
    ? contactList.filter((c) => c.companyId === selectedCompanyId)
    : contactList

  useEffect(() => {
    if (!selectedCompanyId) return
    const currentContactId = getValues("contactId")
    if (currentContactId) {
      const stillValid = contacts.some((c) => c.id === currentContactId && c.companyId === selectedCompanyId)
      if (!stillValid) setValue("contactId", "")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId])

  const dealId = useWatch({ control, name: "dealId" })
  useEffect(() => {
    setValue("amount", calculatedTotal)
  }, [calculatedTotal, setValue])

  // When a deal is selected, auto-fill a line item from the deal's value
  useEffect(() => {
    if (!dealId || dealId === "" || invoice) return
    const deal = deals.find(d => d.id === dealId)
    if (!deal) return
    // Pre-fill line items with deal value
    if (deal.value) {
      const existing = items
      if (existing.length === 1 && !existing[0].service && !existing[0].price) {
        setValue(`items.0.service`, deal.title)
        setValue(`items.0.price`, deal.value)
      } else {
        append({ service: deal.title, price: deal.value })
      }
    }
    // Auto-link contact/company from deal if not already set
    if (deal.contactId && !getValues("contactId")) setValue("contactId", deal.contactId)
    if (deal.companyId && !getValues("companyId")) setValue("companyId", deal.companyId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId])

  useEffect(() => {
    if (invoice) {
      reset({
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        status: invoice.status,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "",
        issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : "",
        contactId: invoice.contactId ?? "",
        companyId: invoice.companyId ?? "",
        dealId: invoice.dealId ?? "",
        items: invoice.items?.map(item => ({ service: item.service, price: item.price })) ?? [{ service: "", price: 0 }],
      })
    } else {
      reset({ 
        status: "DRAFT", 
        amount: 0, 
        issueDate: today,
        dueDate: defaultDueDate,
        items: [{ service: "", price: 0 }],
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`
      })
    }
  }, [invoice, reset, today, defaultDueDate])

  const onSubmit = async (data: InvoiceInput): Promise<void> => {
    if (invoice) {
      updateInvoice.mutate({ id: invoice.id, data: data as Partial<Invoice> }, {
        onSuccess: (saved) => onSave(saved as Invoice)
      });
    } else {
      createInvoice.mutate(data as Partial<Invoice>, {
        onSuccess: (saved) => onSave(saved as Invoice)
      });
    }
  }

  const isSaving = createInvoice.isPending || updateInvoice.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col p-0 bg-sidebar border-border rounded-2xl shadow-2xl">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-overlay/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/20">
              <Receipt className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {invoice ? "Edit Invoice" : "Create New Invoice"}
              </DialogTitle>
              <p className="text-xs text-subtle mt-0.5">
                Generate professional billing for your services
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-subtle/70">
              <FileText className="h-3 w-3" />
              General Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-surface/30 border border-border/50">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted">Invoice Number</Label>
                <Input
                  placeholder="INV-0001"
                  className="bg-surface h-9"
                  {...register("invoiceNumber")}
                />
                {errors.invoiceNumber && <p className="text-[10px] text-red-400 font-medium flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> {errors.invoiceNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-surface h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-subtle/70">
              <Calendar className="h-3 w-3" />
              Timeline
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-surface/30 border border-border/50">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted font-medium">Issue Date</Label>
                <Input type="date" className="bg-surface h-9" {...register("issueDate")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted font-medium">Due Date</Label>
                <Input type="date" className="bg-surface h-9" {...register("dueDate")} />
                {errors.dueDate && <p className="text-[10px] text-red-400 font-medium flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> {errors.dueDate.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-subtle/70">
                <Plus className="h-3 w-3" />
                Services & Pricing
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ service: "", price: 0 })}
                className="h-7 px-3 text-[10px] uppercase tracking-wider font-bold bg-accent/5 border-accent/20 text-accent hover:bg-accent/10"
              >
                Add Row
              </Button>
            </div>
            
            <div className="space-y-3 p-4 rounded-xl bg-surface/30 border border-border/50">
              <div className="grid grid-cols-[1fr_90px_36px] sm:grid-cols-[1fr_120px_40px] gap-2 sm:gap-3 px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-subtle/50">Description / Service</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-subtle/50">Price ($)</span>
                <span></span>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 sm:gap-3 items-start animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex-1">
                    <Input
                      placeholder="e.g. Monthly Consulting Fee"
                      className="bg-surface h-9"
                      {...register(`items.${index}.service` as const)}
                    />
                  </div>
                  <div className="w-[90px] sm:w-[120px]">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-surface h-9 font-mono"
                      {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                    />
                  </div>
                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-9 w-9 shrink-0 text-subtle hover:text-red-400 hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : <div className="w-9 h-9 shrink-0" />}
                </div>
              ))}
              {errors.items && <p className="text-xs text-red-400 mt-2">{errors.items.message}</p>}
              
              <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center px-2">
                <span className="text-sm font-medium text-subtle">Total Revenue:</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ${calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Relations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-subtle/70">
              <Briefcase className="h-3 w-3" />
              Client Relationship
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 rounded-xl bg-surface/30 border border-border/50">
              {/* Deal selector — full width */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> Link to Deal</Label>
                <Controller
                  name="dealId"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value || "none"} 
                      onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    >
                      <SelectTrigger className="bg-surface h-9">
                        <SelectValue placeholder="Select Deal (auto-fills price)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {Array.isArray(deals) && deals.map((d) => (
                          <SelectItem key={d.id} value={d.id} className="text-xs">
                            <span className="font-medium">{d.title}</span>
                            {d.value ? <span className="ml-2 text-emerald-400 font-mono">${d.value.toLocaleString()}</span> : null}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted flex items-center gap-1.5"><UserIcon className="h-3 w-3" /> Contact{selectedCompanyId ? " (filtered)" : ""}</Label>
                  <Controller
                    name="contactId"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        value={field.value || "none"} 
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      >
                        <SelectTrigger className="bg-surface h-9"><SelectValue placeholder="Select Contact" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {Array.isArray(filteredContacts) && filteredContacts.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">{c.firstName} {c.lastName}</SelectItem>
                          ))}
                          {selectedCompanyId && Array.isArray(filteredContacts) && filteredContacts.length === 0 && (
                            <div className="px-2 py-3 text-xs text-subtle text-center">No contacts for this company</div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Company</Label>
                  <Controller
                    name="companyId"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        value={field.value || "none"} 
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      >
                        <SelectTrigger className="bg-surface h-9"><SelectValue placeholder="Select Company" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                        {Array.isArray(companies) && companies.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-overlay/30">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="text-subtle hover:text-foreground"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving}
            onClick={handleSubmit(onSubmit)}
            className="px-8 bg-accent hover:bg-accent/90 text-white font-bold"
          >
            {isSaving ? "Processing..." : invoice ? "Update Invoice" : "Finalize & Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
