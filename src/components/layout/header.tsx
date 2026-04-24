import { Search, Moon, ChevronDown, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-[#1e1e24] bg-[#09090b] shrink-0">
      <div className="flex items-center gap-6 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-[#52525b] hover:text-white"
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-0 max-w-md flex-1">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b] group-focus-within:text-[#7c3aed] transition-colors" />
            <input
              placeholder="Search something ..."
              className="w-full bg-[#18181b] border border-[#1e1e24] border-r-0 rounded-l-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#7c3aed] transition-all"
            />
          </div>
          <button className="bg-[#7c3aed] text-white px-5 py-2 rounded-r-md text-sm font-semibold hover:bg-[#6d28d9] transition-all flex items-center gap-2">
            Search <Search className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1e1e24] hover:bg-[#18181b] transition-colors cursor-pointer group">
          <div className="h-5 w-5 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-gray-800">
            <span className="text-[10px]">🇬🇧</span>
          </div>
          <span className="text-sm font-medium text-white">English</span>
          <ChevronDown className="h-4 w-4 text-[#52525b] group-hover:text-white transition-colors" />
        </div>

        <div className="flex items-center gap-3 border-l border-[#1e1e24] ml-3 pl-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#18181b] transition-colors cursor-pointer group">
            <span className="text-sm font-bold text-white">$ USD</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-[#52525b] hover:text-white"
          >
            <Moon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
