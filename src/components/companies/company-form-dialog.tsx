"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { companySchema, type CompanyInput } from "@/lib/validations"
import { Company } from "@/types/crm-types"
import { useCreateCompany, useUpdateCompany } from "@/hooks/crm-hooks"

interface CompanyFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (company: Company) => void
  company?: Company | null
}

const industries = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Education", "Real Estate", "Other"]
const sizes = ["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]

export function CompanyFormDialog({ open, onClose, onSave, company }: CompanyFormDialogProps) {
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
  })

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        website: company.website ?? "",
        industry: company.industry ?? "",
        size: company.size ?? undefined,
        phone: company.phone ?? "",
        email: company.email ?? "",
        address: company.address ?? "",
        city: company.city ?? "",
        country: company.country ?? "",
      })
    } else {
      reset({})
    }
  }, [company, reset])

  const onSubmit = async (data: CompanyInput) => {
    const payload = {
      ...data,
      size: data.size === "" ? undefined : data.size
    }
    if (company) {
      updateCompany.mutate({ id: company.id, data: payload as any }, {
        onSuccess: (saved) => onSave(saved as Company)
      });
    } else {
      createCompany.mutate(payload as any, {
        onSuccess: (saved) => onSave(saved as Company)
      });
    }
  }

  const isSaving = createCompany.isPending || updateCompany.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? "Edit Company" : "Add Company"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5">
            <Label>Company name *</Label>
            <Input placeholder="Acme Corp" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Controller
                name="industry"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Company size</Label>
              <Controller
                name="size"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input placeholder="https://example.com" {...register("website")} />
            {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="info@example.com" {...register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input placeholder="+1 555 0100" {...register("phone")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input placeholder="New York" {...register("city")} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input placeholder="USA" {...register("country")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : company ? "Save changes" : "Add company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
