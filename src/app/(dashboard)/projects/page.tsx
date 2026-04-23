import { Layout } from "lucide-react"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function ProjectsPage() {
  return (
    <ComingSoon
      title="Projects"
      description="Track customer projects from kickoff to delivery. Manage tasks, milestones, and collaborate with your team in real time."
      icon={Layout}
    />
  )
}
