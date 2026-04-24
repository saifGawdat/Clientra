import { Phone, Mail, Users, SquareCheck, FileText, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: SquareCheck,
  NOTE: FileText,
}

const COLORS: Record<string, string> = {
  CALL: "text-blue-400",
  EMAIL: "text-accent-light",
  MEETING: "text-emerald-400",
  TASK: "text-amber-400",
  NOTE: "text-muted",
}

interface ActivityTypeIconProps {
  type: string
  className?: string
}

export function ActivityTypeIcon({ type, className }: ActivityTypeIconProps) {
  const Icon = ICONS[type] ?? FileText
  return <Icon className={cn("h-4 w-4 shrink-0", COLORS[type] ?? "text-muted", className)} />
}
