"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Target,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

const sections = [
  {
    title: "Navigation",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/companies", label: "Companies", icon: Building2 },
      { href: "/contacts", label: "Contacts", icon: Users },
      { href: "/leads", label: "Leads", icon: Briefcase },
      { href: "/targets", label: "Targets", icon: Target },
      { href: "/opportunities", label: "Opportunities", icon: TrendingUp },
    ],
  },
  {
    title: "Activities",
    items: [
      { href: "/activities", label: "Activities", icon: Calendar },
    ],
  },
]

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(["Sales"])

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  const alwaysOpen = ["Navigation", "Activities"]

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-[#09090b] text-[#a1a1aa] transition-all duration-200 shrink-0 border-r border-[#1e1e24]",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        {!collapsed && (
          <span className="font-bold text-xl tracking-tight text-white">NextCRM</span>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto px-3 space-y-6"
        style={{ scrollbarWidth: "none" }}
      >
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <button
                onClick={() => !alwaysOpen.includes(section.title) && toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-[#52525b] hover:text-[#a1a1aa] transition-colors"
              >
                <span>{section.title}</span>
                {!alwaysOpen.includes(section.title) && (
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      !openSections.includes(section.title) && "-rotate-90"
                    )}
                  />
                )}
              </button>
            )}

            {(collapsed || openSections.includes(section.title) || alwaysOpen.includes(section.title)) && (
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/")
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all group",
                        active
                          ? "bg-[#18181b] text-white border-l-2 border-[#7c3aed]"
                          : "hover:bg-[#18181b] hover:text-white"
                      )}
                      title={collapsed ? label : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-[#7c3aed]" : "text-[#52525b] group-hover:text-[#a1a1aa]"
                        )}
                      />
                      {!collapsed && <span>{label}</span>}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-[#1e1e24] bg-[#09090b]">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="bg-red-900/50 text-red-200 text-xs font-bold">
                {getInitials(user.name ?? user.email ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate leading-none mb-1">
                {user.name ?? "User"}
              </p>
              <p className="text-[11px] text-[#52525b] truncate">{user.email ?? ""}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#52525b]" />
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-[#18181b] hover:text-white transition-colors",
              pathname === "/settings" && "bg-[#18181b] text-white"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 shrink-0 text-[#52525b]" />
            {!collapsed && <span>Settings</span>}
          </Link>

          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" })
                window.location.href = "/login"
              } catch (e) {
                console.error("Logout error:", e)
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-[#18181b] hover:text-white transition-colors"
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0 text-[#52525b]" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#18181b] border border-[#1e1e24] flex items-center justify-center hover:bg-[#27272a] transition-colors z-20"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-[#a1a1aa]" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-[#a1a1aa]" />
        )}
      </button>
    </aside>
  )
}
