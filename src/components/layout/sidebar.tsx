"use client";

import { ClientraIcon } from "@/components/ui/clientra-icon";
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
  X,
  Receipt,
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
      { href: "/invoices", label: "Invoices", icon: Receipt },
    ],
  },
  {
    title: "Activities",
    items: [{ href: "/activities", label: "Activities", icon: Calendar }],
  },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ user, mobileOpen = false, onMobileClose }: SidebarProps) {
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
        "fixed md:relative inset-y-0 left-0 z-50 md:z-auto print:hidden",
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0 border-r border-border",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-12" : "md:w-52",
        "w-52",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="h-6 w-6 shrink-0 flex items-center justify-center">
          <ClientraIcon size={24} className="h-6 w-6" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base tracking-tight text-foreground flex-1">
            Clientra
          </span>

        )}
        <button
          onClick={onMobileClose}
          className="md:hidden h-6 w-6 flex items-center justify-center rounded-sm hover:bg-sidebar-accent text-subtle hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-2 space-y-4"
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
                className="w-full flex items-center justify-between px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-subtle hover:text-muted transition-colors"
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
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs font-medium transition-all group",
                        active
                          ? "bg-linear-to-r from-accent/15 to-transparent text-foreground border-l-2 border-accent"
                          : "hover:bg-sidebar-accent hover:text-foreground",
                      )}
                      title={collapsed ? label : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors",
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

      <div className="p-2 border-t border-border bg-sidebar">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mb-1">
            <Avatar className="h-6 w-6 border border-foreground/10">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="bg-red-900/50 text-red-200 text-[9px] font-bold">
                {getInitials(user.name ?? user.email ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate leading-none mb-0.5">
                {user.name ?? "User"}
              </p>
              <p className="text-[10px] text-subtle truncate">
                {user.email ?? ""}
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-subtle" />
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          <Link
            href="/settings"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs font-medium hover:bg-sidebar-accent hover:text-foreground transition-colors",
              pathname === "/settings" && "bg-sidebar-accent text-foreground",
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-3.5 w-3.5 shrink-0 text-subtle" />
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
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs font-medium hover:bg-sidebar-accent hover:text-foreground transition-colors"
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0 text-subtle" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-surface border border-border items-center justify-center hover:bg-surface-raised transition-colors z-20"
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
