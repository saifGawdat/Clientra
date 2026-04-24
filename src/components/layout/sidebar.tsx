"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Kanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const sections = [
  {
    title: "Navigation",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Sales",
    items: [
      { href: "/companies", label: "Companies", icon: Building2 },
      { href: "/contacts", label: "Contacts", icon: Users },
      { href: "/leads", label: "Leads", icon: Briefcase },
      { href: "/targets", label: "Targets", icon: Target },
      { href: "/opportunities", label: "Opportunities", icon: TrendingUp },
      { href: "/pipeline", label: "Pipeline", icon: Kanban },
    ],
  },
  {
    title: "Activities",
    items: [{ href: "/activities", label: "Activities", icon: Calendar }],
  },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["Sales"]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const alwaysOpen = ["Navigation", "Activities"];

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 shrink-0 border-r border-border",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="h-8 w-8 shrink-0 flex items-center justify-center">
          <Image
            src="/clientra-icon-dark.svg"
            alt="Clientra"
            width={32}
            height={32}
            className="h-8 w-8"
          />
        </div>
        {!collapsed && (
          <span className="font-bold text-xl tracking-tight text-foreground">
            Clientra
          </span>
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
                onClick={() =>
                  !alwaysOpen.includes(section.title) &&
                  toggleSection(section.title)
                }
                className="w-full flex items-center justify-between px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-subtle hover:text-muted transition-colors"
              >
                <span>{section.title}</span>
                {!alwaysOpen.includes(section.title) && (
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      !openSections.includes(section.title) && "-rotate-90",
                    )}
                  />
                )}
              </button>
            )}

            {(collapsed ||
              openSections.includes(section.title) ||
              alwaysOpen.includes(section.title)) && (
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all group",
                        active
                          ? "bg-sidebar-accent text-foreground border-l-2 border-accent"
                          : "hover:bg-sidebar-accent hover:text-foreground",
                      )}
                      title={collapsed ? label : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active
                            ? "text-accent"
                            : "text-subtle group-hover:text-muted",
                        )}
                      />
                      {!collapsed && <span>{label}</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border bg-sidebar">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <Avatar className="h-8 w-8 border border-foreground/10">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="bg-red-900/50 text-red-200 text-xs font-bold">
                {getInitials(user.name ?? user.email ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate leading-none mb-1">
                {user.name ?? "User"}
              </p>
              <p className="text-[11px] text-subtle truncate">
                {user.email ?? ""}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-subtle" />
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-sidebar-accent hover:text-foreground transition-colors",
              pathname === "/settings" && "bg-sidebar-accent text-foreground",
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 shrink-0 text-subtle" />
            {!collapsed && <span>Settings</span>}
          </Link>

          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              } catch (e) {
                console.error("Logout error:", e);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-sidebar-accent hover:text-foreground transition-colors"
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0 text-subtle" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-raised transition-colors z-20"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-muted" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-muted" />
        )}
      </button>
    </aside>
  );
}
