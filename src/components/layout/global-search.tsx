"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, User, Building2, Briefcase, FileText, X } from "lucide-react";

import Link from "next/link";

interface SearchContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface SearchCompany {
  id: string;
  name: string;
}

interface SearchDeal {
  id: string;
  title: string;
  value: number | null;
}

interface SearchInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
}

interface SearchResults {
  contacts: SearchContact[];
  companies: SearchCompany[];
  deals: SearchDeal[];
  invoices: SearchInvoice[];
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) return;

    const ac = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      (async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
            signal: ac.signal,
          });
          if (res.ok) {
            const data = await res.json();
            setResults(data);
            setIsOpen(true);
          }
        } catch (error) {
          if ((error as Error).name === "AbortError") return;
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      })();
    }, 300);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [query]);

  const hasResults = results && (
    results.contacts.length > 0 ||
    results.companies.length > 0 ||
    results.deals.length > 0 ||
    results.invoices.length > 0
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) {
      setResults(null);
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
  };

  return (
    <div className="hidden sm:flex items-center gap-0 max-w-md flex-1 relative" ref={dropdownRef}>
      <div className="relative flex-1 group">
        {isLoading ? (
          <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-violet-500 animate-spin" />
        ) : (
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-subtle group-focus-within:text-violet-500 transition-colors" />
        )}
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search something ..."
          className="w-full bg-surface border border-border border-r-0 rounded-l-md pl-8 pr-8 py-1.5 text-xs text-foreground focus:outline-none focus:border-violet-500 transition-all placeholder:text-subtle"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <button className="bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white px-3 py-1.5 rounded-r-md text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-sm shadow-violet-900/30">
        Search <Search className="h-2.5 w-2.5" />
      </button>

      {/* Dropdown Results */}
      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-md shadow-xl z-50 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
          {!isLoading && !hasResults ? (
            <div className="p-4 text-center text-xs text-subtle">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="p-2 space-y-3">
              {results?.contacts && results.contacts.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-subtle uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 mb-1">
                    <User className="h-3 w-3" /> Contacts
                  </div>
                  <div className="space-y-0.5">
                    {results.contacts.map((contact) => (
                      <Link
                        key={contact.id}
                        href={`/contacts/${contact.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-2 py-1.5 rounded-sm hover:bg-violet-500/10 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate group-hover:text-violet-500">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-[10px] text-subtle truncate">{contact.email}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results?.companies && results.companies.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-subtle uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 mb-1">
                    <Building2 className="h-3 w-3" /> Companies
                  </div>
                  <div className="space-y-0.5">
                    {results.companies.map((company) => (
                      <Link
                        key={company.id}
                        href={`/companies/${company.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-2 py-1.5 rounded-sm hover:bg-violet-500/10 transition-colors group"
                      >
                        <div className="text-xs font-medium truncate group-hover:text-violet-500">{company.name}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results?.deals && results.deals.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-subtle uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 mb-1">
                    <Briefcase className="h-3 w-3" /> Deals
                  </div>
                  <div className="space-y-0.5">
                    {results.deals.map((deal) => (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-2 py-1.5 rounded-sm hover:bg-violet-500/10 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate group-hover:text-violet-500">{deal.title}</div>
                          <div className="text-[10px] text-subtle truncate">{deal.value ? `$${deal.value.toLocaleString()}` : ""}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results?.invoices && results.invoices.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-subtle uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 mb-1">
                    <FileText className="h-3 w-3" /> Invoices
                  </div>
                  <div className="space-y-0.5">
                    {results.invoices.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/invoices/${invoice.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-2 py-1.5 rounded-sm hover:bg-violet-500/10 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate group-hover:text-violet-500">{invoice.invoiceNumber}</div>
                          <div className="text-[10px] text-subtle truncate">${invoice.amount.toLocaleString()}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
