"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { activitySchema, type ActivityInput } from "@/lib/validations"
import { CRMActivity } from "@/types/crm-types"
import { useCreateActivity, useUpdateActivity } from "@/hooks/crm-hooks"

interface ActivityFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (activity: CRMActivity) => void
  activity?: CRMActivity | null
  contacts: { id: string; firstName: string; lastName: string }[]
  deals: { id: string; title: string }[]
}

const TYPES = ["CALL", "EMAIL", "MEETING", "TASK", "NOTE"]
const STATUSES = ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

export function ActivityFormDialog({ open, onClose, onSave, activity, contacts, deals }: ActivityFormDialogProps) {
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: { type: "CALL" as const, status: "PLANNED" as const },
  })

  useEffect(() => {
    if (activity) {
      reset({
        type: activity.type,
        subject: activity.subject,
        description: activity.description ?? "",
        status: activity.status,
        scheduledAt: activity.scheduledAt
          ? new Date(activity.scheduledAt).toISOString().slice(0, 16)
          : "",
        contactId: activity.contactId ?? "",
        dealId: activity.dealId ?? "",
      })
    } else {
      reset({ type: "CALL", status: "PLANNED" })
    }
  }, [activity, reset])

  const onSubmit = async (data: ActivityInput) => {
    if (activity) {
      updateActivity.mutate({ id: activity.id, data }, {
        onSuccess: (saved) => onSave(saved as CRMActivity)
      });
    } else {
      createActivity.mutate(data, {
        onSuccess: (saved) => {
          onSave(saved as CRMActivity);
          reset({ type: "CALL", status: "PLANNED" });
        }
      });
    }
  }

  const isSaving = createActivity.isPending || updateActivity.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity ? "Edit Activity" : "Log Activity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Subject *</Label>
            <Input placeholder="Called to discuss proposal..." {...register("subject")} />
            {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="Activity notes..." {...register("description")} className="min-h-[80px]" />
          </div>

          <div className="space-y-1.5">
            <Label>Scheduled date</Label>
            <Input type="datetime-local" {...register("scheduledAt")} />
          </div>

          <div className="space-y-1.5">
            <Label>Contact</Label>
            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value || "none"} 
                  onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {Array.isArray(contacts) && contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Deal</Label>
            <Controller
              name="dealId"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value || "none"} 
                  onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select deal" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {Array.isArray(deals) && deals.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : activity ? "Save changes" : "Log activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
