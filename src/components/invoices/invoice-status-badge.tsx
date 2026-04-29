import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { InvoiceStatus } from "@/types/crm-types"

const STATUS_CONFIG: Record<
  InvoiceStatus,
  {
    variant: "default" | "secondary" | "success" | "warning" | "destructive"
    label: string
    dot: string
  }
> = {
  DRAFT: { variant: "secondary", label: "Draft", dot: "bg-zinc-400" },
  SENT: { variant: "default", label: "Sent", dot: "bg-blue-400" },
  PAID: { variant: "success", label: "Paid", dot: "bg-emerald-400" },
  OVERDUE: { variant: "destructive", label: "Overdue", dot: "bg-red-400" },
  CANCELLED: { variant: "secondary", label: "Cancelled", dot: "bg-zinc-600" },
}

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  className?: string
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      <Badge variant={cfg.variant} className="text-[10px] uppercase tracking-wider font-bold h-5 px-1.5">
        {cfg.label}
      </Badge>
    </div>
  )
}
