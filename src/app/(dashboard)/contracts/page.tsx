import { FileText } from "lucide-react"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function ContractsPage() {
  return (
    <ComingSoon
      title="Contracts"
      description="Create, send, and track contracts with your customers. E-signatures, templates, and version history — all in one place."
      icon={FileText}
    />
  )
}
