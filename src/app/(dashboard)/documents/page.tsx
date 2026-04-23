import { Files } from "lucide-react"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function DocumentsPage() {
  return (
    <ComingSoon
      title="Documents"
      description="Store, organize, and share documents with your team. Attach files to deals, contacts, and companies."
      icon={Files}
    />
  )
}
