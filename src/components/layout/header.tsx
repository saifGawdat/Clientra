"use client";

import { Search, Moon, Sun, ChevronDown, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-background shrink-0">
      <div className="flex items-center gap-6 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-subtle hover:text-foreground"
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-0 max-w-md flex-1">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle group-focus-within:text-accent transition-colors" />
            <input
              placeholder="Search something ..."
              className="w-full bg-surface border border-border border-r-0 rounded-l-md pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-all placeholder:text-subtle"
            />
          </div>
          <button className="bg-accent text-white px-5 py-2 rounded-r-md text-sm font-semibold hover:bg-accent-hover transition-all flex items-center gap-2">
            Search <Search className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-surface transition-colors cursor-pointer group">
          <div className="h-5 w-5 rounded-full overflow-hidden border border-foreground/10 flex items-center justify-center bg-surface-raised">
            <span className="text-[10px]">🇬🇧</span>
          </div>
          <span className="text-sm font-medium text-foreground">English</span>
          <ChevronDown className="h-4 w-4 text-subtle group-hover:text-foreground transition-colors" />
        </div>

        <div className="flex items-center gap-3 border-l border-border ml-3 pl-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-surface transition-colors cursor-pointer">
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
