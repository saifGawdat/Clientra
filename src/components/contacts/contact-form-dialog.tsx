"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contactSchema, type ContactInput } from "@/lib/validations"
import { Contact } from "@/types/crm-types"
import { useCreateContact, useUpdateContact } from "@/hooks/crm-hooks"

interface ContactFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (contact: Contact) => void
  contact?: Contact | null
  companies: { id: string; name: string }[]
}

export function ContactFormDialog({ open, onClose, onSave, contact, companies }: ContactFormDialogProps) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { status: "LEAD" as const, source: "OTHER" as const, tags: [] },
  })

  useEffect(() => {
    if (contact) {
      reset({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        title: contact.title ?? "",
        status: contact.status,
        source: contact.source,
        companyId: contact.companyId ?? "",
        tags: contact.tags ?? [],
      })
    } else {
      reset({ status: "LEAD", source: "OTHER", tags: [] })
    }
  }, [contact, reset])

  const onSubmit = async (data: ContactInput) => {
    if (contact) {
      updateContact.mutate({ id: contact.id, data }, {
        onSuccess: (saved) => onSave(saved as Contact)
      });
    } else {
      createContact.mutate(data, {
        onSuccess: (saved) => onSave(saved as Contact)
      });
    }
  }

  const isSaving = createContact.isPending || updateContact.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit Contact" : "Add Contact"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First name *</Label>
              <Input placeholder="John" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Last name *</Label>
              <Input placeholder="Doe" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="john@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input placeholder="+1 555 0100" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label>Job title</Label>
              <Input placeholder="CEO" {...register("title")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["TARGET", "LEAD", "PROSPECT", "CUSTOMER", "CHURNED", "INACTIVE"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["WEBSITE", "REFERRAL", "SOCIAL", "EMAIL", "COLD_CALL", "EVENT", "OTHER"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          {companies.length > 0 && (
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value || "none"} 
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : contact ? "Save changes" : "Add contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
