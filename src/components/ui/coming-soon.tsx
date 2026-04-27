import { type LucideIcon } from "lucide-react"

interface ComingSoonProps {
  title: string
  description: string
  icon: LucideIcon
}

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="p-8 min-h-full flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="h-16 w-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-6">
          <Icon className="h-7 w-7 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>
        <p className="text-subtle text-sm leading-relaxed mb-6">{description}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-surface border border-border text-muted text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse inline-block" />
          Coming soon
        </div>
      </div>
    </div>
  )
}
