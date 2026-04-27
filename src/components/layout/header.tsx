"use client";

import Image from "next/image";
import { Menu, Search, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="relative flex items-center h-10 sm:h-11 px-3 sm:px-4 border-b border-border bg-background shrink-0 gap-2">
      {/* Left: hamburger (mobile) + search (desktop) */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="text-subtle hover:text-foreground md:hidden shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:flex items-center gap-0 max-w-md flex-1">
          <div className="relative flex-1 group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-subtle group-focus-within:text-accent transition-colors" />
            <input
              placeholder="Search something ..."
              className="w-full bg-surface border border-border border-r-0 rounded-l-md pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent transition-all placeholder:text-subtle"
            />
          </div>
          <button className="bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white px-3 py-1.5 rounded-r-md text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-sm shadow-violet-900/30">
            Search <Search className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {/* Center: logo — mobile only */}
      <div className="absolute left-1/2 -translate-x-1/2 md:hidden flex items-center gap-2 pointer-events-none select-none">
        <Image src="/clientra-icon-dark.svg" alt="Clientra" width={24} height={24} />
        <span className="font-bold text-lg tracking-tight text-foreground">Clientra</span>
      </div>

      {/* Right: language, currency, theme toggle */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md border border-border hover:bg-surface transition-colors cursor-pointer group">
          <div className="h-4 w-4 rounded-full overflow-hidden border border-foreground/10 flex items-center justify-center bg-surface-raised">
            <span className="text-[9px]">🇬🇧</span>
          </div>
          <span className="text-xs font-medium text-foreground">English</span>
          <ChevronDown className="h-3 w-3 text-subtle group-hover:text-foreground transition-colors" />
        </div>

        <div className="flex items-center gap-1.5 lg:border-l lg:border-border lg:ml-1.5 lg:pl-1.5">
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface transition-colors cursor-pointer">
            <span className="text-xs font-bold text-foreground">$ USD</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-subtle hover:text-foreground h-7 w-7"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
