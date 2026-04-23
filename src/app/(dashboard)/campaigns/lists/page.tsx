import { Users } from "lucide-react"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function CampaignListsPage() {
  return (
    <ComingSoon
      title="Target Lists"
      description="Build segmented contact lists for precision targeting. Filter by industry, status, source, or any custom attribute."
      icon={Users}
    />
  )
}
