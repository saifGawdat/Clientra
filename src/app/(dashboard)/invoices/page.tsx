import { Receipt } from "lucide-react"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function InvoicesPage() {
  return (
    <ComingSoon
      title="Invoices"
      description="Create and send professional invoices. Track payment status, send reminders, and reconcile revenue automatically."
      icon={Receipt}
    />
  )
}
