"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dealSchema, type DealInput } from "@/lib/validations"

interface DealFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (deal: any) => void
  deal?: any | null
  contacts: { id: string; firstName: string; lastName: string }[]
  companies: { id: string; name: string }[]
}

const STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"]

export function DealFormDialog({ open, onClose, onSave, deal, contacts, companies }: DealFormDialogProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<DealInput>({
    resolver: zodResolver(dealSchema),
    defaultValues: { stage: "LEAD" as const, currency: "USD" },
  })

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
    const url = deal ? `/api/deals/${deal.id}` : "/api/deals"
    const method = deal ? "PATCH" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const saved = await res.json()
      onSave(saved)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit Deal" : "Add Deal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Deal title *</Label>
            <Input placeholder="Enterprise subscription" {...register("title")} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input type="number" placeholder="10000" {...register("value", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={watch("stage")} onValueChange={(v) => setValue("stage", v as DealInput["stage"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
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
            <Label>Contact</Label>
            <Select 
              value={watch("contactId") || "none"} 
              onValueChange={(v) => setValue("contactId", v === "none" ? "" : v)}
            >
              <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Company</Label>
            <Select 
              value={watch("companyId") || "none"} 
              onValueChange={(v) => setValue("companyId", v === "none" ? "" : v)}
            >
              <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="Deal notes..." {...register("description")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : deal ? "Save changes" : "Add deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
