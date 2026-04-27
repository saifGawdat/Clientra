"use client"

import { useState } from "react"
import { Plus, Phone, Mail, Users, FileText, Calendar, Trash2, CheckCircle2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ActivityFormDialog } from "@/components/activities/activity-form-dialog"
import { useConfirm } from "@/components/ui/confirm-modal"
import { SquareCheck } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { CRMActivity } from "@/types/crm-types"

const typeIcon: Record<string, React.ElementType> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: SquareCheck,
  NOTE: FileText,
}

const typeColor: Record<string, string> = {
  CALL: "text-blue-400 bg-blue-950/40 border border-blue-800/30",
  EMAIL: "text-accent-light bg-accent/20 border border-accent/30",
  MEETING: "text-emerald-400 bg-emerald-950/40 border border-emerald-800/30",
  TASK: "text-amber-400 bg-amber-950/40 border border-amber-800/30",
  NOTE: "text-muted bg-surface border border-border",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "purple"> = {
  PLANNED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
}

interface ActivitiesClientProps {
  initialActivities: CRMActivity[]
  contacts: { id: string; firstName: string; lastName: string }[]
  deals: { id: string; title: string }[]
}

export function ActivitiesClient({ initialActivities, contacts, deals }: ActivitiesClientProps) {
  const confirm = useConfirm()
  const [activities, setActivities] = useState<CRMActivity[]>(initialActivities)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<CRMActivity | null>(null)
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const filtered = activities.filter((a) => {
    if (filterType && a.type !== filterType) return false
    if (filterStatus && a.status !== filterStatus) return false
    return true
  })

  const handleSave = (activity: CRMActivity) => {
    setActivities((prev) => {
      const idx = prev.findIndex((a) => a.id === activity.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = activity
        return next
      }
      return [activity, ...prev]
    })
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm({
      title: "Delete Activity?",
      description: "This action cannot be undone.",
      variant: "destructive"
    }))) return
    await fetch(`/api/activities/${id}`, { method: "DELETE" })
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    })
    if (res.ok) {
      const updated = await res.json()
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)))
    }
  }

  const types = ["CALL", "EMAIL", "MEETING", "TASK", "NOTE"]
  const statuses = ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Activities</h1>
          <p className="text-subtle text-sm mt-1">{activities.length} total activities</p>
        </div>
        <Button onClick={() => { setEditingActivity(null); setShowForm(true) }}>
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterType("")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            !filterType ? "bg-accent text-white" : "bg-surface border border-border text-subtle hover:text-muted"
          )}
        >
          All types
        </button>
        {types.map((t) => {
          const Icon = typeIcon[t]
          return (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? "" : t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors",
                filterType === t
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-subtle hover:text-muted"
              )}
            >
              <Icon className="h-3 w-3" />{t}
            </button>
          )
        })}
        <div className="w-px h-5 bg-border mx-1" />
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filterStatus === s
                ? "bg-accent text-white"
                : "bg-surface border border-border text-subtle hover:text-muted"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-subtle text-sm">
            No activities yet. Log your first one!
          </div>
        )}
        {filtered.map((activity) => {
          const Icon = typeIcon[activity.type] ?? FileText
          const colorClass = typeColor[activity.type] ?? typeColor.NOTE

          return (
            <div
              key={activity.id}
              className={cn(
                "oled-card flex items-start gap-4",
                activity.status === "COMPLETED" && "opacity-50"
              )}
            >
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cn("font-medium text-sm text-foreground", activity.status === "COMPLETED" && "line-through")}>
                      {activity.subject}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-subtle mt-0.5">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {activity.contact && (
                        <span className="text-xs text-accent">
                          {activity.contact.firstName} {activity.contact.lastName}
                        </span>
                      )}
                      {activity.deal && (
                        <span className="text-xs text-muted">{activity.deal.title}</span>
                      )}
                      {activity.scheduledAt && (
                        <span className="flex items-center gap-1 text-xs text-subtle">
                          <Calendar className="h-3 w-3" />
                          {formatDate(activity.scheduledAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={statusVariant[activity.status]}>{activity.status}</Badge>
                    {activity.status !== "COMPLETED" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-emerald-400 hover:text-emerald-400 hover:bg-emerald-950/30"
                        onClick={() => handleComplete(activity.id)}
                        title="Mark complete"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditingActivity(activity); setShowForm(true) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-400 hover:bg-red-950/30"
                      onClick={() => handleDelete(activity.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ActivityFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingActivity(null) }}
        onSave={handleSave}
        activity={editingActivity}
        contacts={contacts}
        deals={deals}
      />
    </div>
  )
}
