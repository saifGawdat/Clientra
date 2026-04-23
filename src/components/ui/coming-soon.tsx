import { type LucideIcon } from "lucide-react"

interface ComingSoonProps {
  title: string
  description: string
  icon: LucideIcon
}

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="p-8 min-h-full bg-[#09090b] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="h-16 w-16 rounded-2xl bg-[#18181b] border border-[#1e1e24] flex items-center justify-center mx-auto mb-6">
          <Icon className="h-7 w-7 text-[#7c3aed]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
        <p className="text-[#52525b] text-sm leading-relaxed mb-6">{description}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#18181b] border border-[#1e1e24] text-[#a1a1aa] text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed] animate-pulse inline-block" />
          Coming soon
        </div>
      </div>
    </div>
  )
}
