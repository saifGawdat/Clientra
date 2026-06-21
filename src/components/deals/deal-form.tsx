"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Check, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dealSchema, type DealInput } from "@/lib/validations"
import { Deal } from "@/types/crm-types"
import { useCreateDeal, useUpdateDeal } from "@/hooks/crm-hooks"

interface DealFormProps {
  onClose: () => void
  onSave: (deal: Deal) => void
  deal?: Deal | null
  contacts: { id: string; firstName: string; lastName: string; companyId?: string | null }[]
  companies: { id: string; name: string }[]
}

const STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"]

export function DealForm({ onClose, onSave, deal, contacts, companies }: DealFormProps) {
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();

  const { register, handleSubmit, control, reset, watch, setValue, getValues, formState: { errors } } = useForm<DealInput>({
    resolver: zodResolver(dealSchema),
    defaultValues: { stage: "LEAD" as const, currency: "USD" },
  })

  const selectedCompanyId = watch("companyId")
  const selectedContactId = watch("contactId")
  const contactList = useMemo(() => Array.isArray(contacts) ? contacts : [], [contacts]);

  useEffect(() => {
    if (selectedContactId && selectedContactId !== "none") {
      const contact = contactList.find(c => c.id === selectedContactId)
      if (contact && contact.companyId && contact.companyId !== selectedCompanyId) {
        setValue("companyId", contact.companyId, { shouldValidate: true })
      }
    }
  }, [selectedContactId, contactList, setValue, selectedCompanyId])

  const filteredContacts = selectedCompanyId && selectedCompanyId !== "none"
    ? contactList.filter((c) => c.companyId === selectedCompanyId)
    : contactList

  useEffect(() => {
    if (!selectedCompanyId || selectedCompanyId === "none") return
    const currentContactId = getValues("contactId")
    if (currentContactId && currentContactId !== "none") {
      const stillValid = contacts.some((c) => c.id === currentContactId && c.companyId === selectedCompanyId)
      if (!stillValid) setValue("contactId", "")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId])

  useEffect(() => {
    if (deal) {
      reset({
        title: deal.title,
        value: deal.value ?? undefined,
        currency: deal.currency,
        stage: deal.stage,
        probability: deal.probability ?? undefined,
        closeDate: deal.closeDate ? new Date(deal.closeDate).toISOString().split("T")[0] : "",
        description: deal.description ?? "",
        contactId: deal.contactId ?? "",
        companyId: deal.companyId ?? "",
      })
    } else {
      reset({ stage: "LEAD", currency: "USD" })
    }
  }, [deal, reset])

  const onSubmit = async (data: DealInput) => {
    if (deal) {
      updateDeal.mutate({ id: deal.id, data }, {
        onSuccess: (saved) => onSave(saved as Deal)
      });
    } else {
      createDeal.mutate(data, {
        onSuccess: (saved) => onSave(saved as Deal)
      });
    }
  }

  const isSaving = createDeal.isPending || updateDeal.isPending;

  return (
    <div className="flex-1 flex flex-col bg-background animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full p-6 sm:p-12 space-y-8">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10 shrink-0 text-subtle hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            {deal ? "Edit Deal" : "Add Deal"}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <Label>Deal title *</Label>
            <Input placeholder="Enterprise subscription" {...register("title")} className="text-lg py-6" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input type="number" placeholder="10000" {...register("value", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Controller
                name="stage"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Probability (%)</Label>
              <Input type="number" min={0} max={100} placeholder="50" {...register("probability", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Close date</Label>
            <Input type="date" {...register("closeDate")} />
          </div>

          <div className="space-y-1.5">
            <Label>Contact{selectedCompanyId ? " (filtered by company)" : ""}</Label>
            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={[
                    { value: "", label: "None" },
                    ...filteredContacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))
                  ]}
                  placeholder="Select contact"
                  searchPlaceholder="Search contacts..."
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Company</Label>
            <Controller
              name="companyId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={[
                    { value: "", label: "None" },
                    ...companies.map(c => ({ value: c.id, label: c.name }))
                  ]}
                  placeholder="Select company"
                  searchPlaceholder="Search companies..."
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="Deal notes..." className="min-h-[120px]" {...register("description")} />
          </div>

          <div className="pt-6 pb-12 flex justify-end gap-3 border-t border-border">
            <Button type="button" variant="outline" size="lg" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? "Saving..." : deal ? "Save changes" : "Add deal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SearchableSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  searchPlaceholder = "Search..." 
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  const selectedLabel = options.find(o => o.value === value)?.label
  
  return (
    <div className="relative" ref={ref}>
      <Button 
        type="button" 
        variant="outline" 
        role="combobox" 
        className="w-full justify-between font-normal bg-surface border-border text-foreground h-9 px-3 py-2"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-overlay text-foreground shadow-xl animate-in fade-in zoom-in-95">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input 
              autoFocus
              placeholder={searchPlaceholder} 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-subtle disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-subtle text-center">No results found.</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-surface-raised hover:text-foreground"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                    setSearch("")
                  }}
                >
                  {value === option.value && (
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4 text-accent" />
                    </span>
                  )}
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
