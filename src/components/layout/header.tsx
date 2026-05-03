"use client";

import Image from "next/image";
import { Menu, Search, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";

import { GlobalSearch } from "./global-search";

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

        <GlobalSearch />
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
