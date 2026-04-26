"use client";

import { Menu, Search, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 border-b border-border bg-background shrink-0 gap-2">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle group-focus-within:text-accent transition-colors" />
            <input
              placeholder="Search something ..."
              className="w-full bg-surface border border-border border-r-0 rounded-l-md pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-all placeholder:text-subtle"
            />
          </div>
          <button className="bg-accent text-white px-4 py-2 rounded-r-md text-sm font-semibold hover:bg-accent-hover transition-all flex items-center gap-2 shrink-0">
            Search <Search className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-surface transition-colors cursor-pointer group">
          <div className="h-5 w-5 rounded-full overflow-hidden border border-foreground/10 flex items-center justify-center bg-surface-raised">
            <span className="text-[10px]">🇬🇧</span>
          </div>
          <span className="text-sm font-medium text-foreground">English</span>
          <ChevronDown className="h-4 w-4 text-subtle group-hover:text-foreground transition-colors" />
        </div>

        <div className="flex items-center gap-2 lg:border-l lg:border-border lg:ml-2 lg:pl-2">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-surface transition-colors cursor-pointer">
            <span className="text-sm font-bold text-foreground">$ USD</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-subtle hover:text-foreground"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
