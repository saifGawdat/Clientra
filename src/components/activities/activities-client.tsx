"use client"

import { useState } from "react"
import { Plus, Phone, Mail, Users, CheckSquare, FileText, Calendar, Trash2, CheckCircle2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ActivityFormDialog } from "@/components/activities/activity-form-dialog"
import { formatDate } from "@/lib/utils"

type Activity = {
  id: string
  type: string
  subject: string
  description: string | null
  status: string
  scheduledAt: Date | null
  completedAt: Date | null
  contactId: string | null
  dealId: string | null
  contact: { id: string; firstName: string; lastName: string } | null
  deal: { id: string; title: string } | null
  createdAt: Date
}

const typeIcon: Record<string, React.ElementType> = {
  CALL: Phone, EMAIL: Mail, MEETING: Users, TASK: CheckSquare, NOTE: FileText,
}

const typeColor: Record<string, string> = {
  CALL: "text-blue-500 bg-blue-50",
  EMAIL: "text-purple-500 bg-purple-50",
  MEETING: "text-green-500 bg-green-50",
  TASK: "text-orange-500 bg-orange-50",
  NOTE: "text-gray-500 bg-gray-50",
}

const statusVariant: Record<string, any> = {
  PLANNED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
}

interface ActivitiesClientProps {
  initialActivities: Activity[]
  contacts: { id: string; firstName: string; lastName: string }[]
  deals: { id: string; title: string }[]
}

export function ActivitiesClient({ initialActivities, contacts, deals }: ActivitiesClientProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const filtered = activities.filter((a) => {
    if (filterType && a.type !== filterType) return false
    if (filterStatus && a.status !== filterStatus) return false
    return true
  })

  const handleSave = (activity: Activity) => {
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
    if (!confirm("Delete this activity?")) return
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
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activities.length} total activities</p>
        </div>
        <Button onClick={() => { setEditingActivity(null); setShowForm(true) }}>
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterType("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterType ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          All types
        </button>
        {types.map((t) => {
          const Icon = typeIcon[t]
          return (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? "" : t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${filterType === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <Icon className="h-3 w-3" />{t}
            </button>
          )
        })}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No activities yet. Log your first one!
          </div>
        )}
        {filtered.map((activity) => {
          const Icon = typeIcon[activity.type] ?? FileText
          const colorClass = typeColor[activity.type] ?? typeColor.NOTE

          return (
            <Card key={activity.id} className={activity.status === "COMPLETED" ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`font-medium text-sm text-gray-900 ${activity.status === "COMPLETED" ? "line-through" : ""}`}>
                          {activity.subject}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {activity.contact && (
                            <span className="text-xs text-blue-600">
                              {activity.contact.firstName} {activity.contact.lastName}
                            </span>
                          )}
                          {activity.deal && (
                            <span className="text-xs text-purple-600">{activity.deal.title}</span>
                          )}
                          {activity.scheduledAt && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
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
                            className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-50"
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
                          className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
