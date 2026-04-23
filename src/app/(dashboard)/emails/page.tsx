import { Mail } from "lucide-react"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function EmailsPage() {
  return (
    <ComingSoon
      title="E-mails"
      description="Send, receive, and track emails directly from your CRM. Connect your inbox and never miss a follow-up."
      icon={Mail}
    />
  )
}
