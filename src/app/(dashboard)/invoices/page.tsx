"use client";

import { useEffect, useState } from "react";
import { InvoicesClient } from "@/components/invoices/invoices-client";
import { Loader2 } from "lucide-react";
import { Invoice } from "@/types/crm-types";

export default function InvoicesPage() {
  const [data, setData] = useState<{
    invoices: Invoice[];
    contacts: { id: string; firstName: string; lastName: string; companyId?: string | null }[];
    companies: { id: string; name: string }[];
    deals: { id: string; title: string; value?: number | null; currency?: string; contactId?: string | null; companyId?: string | null }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard/invoices-data");
        const json = await res.json();
        
        if (!res.ok) {
          throw new Error(json.details || json.error || "Failed to fetch data");
        }
        
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent opacity-50" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-500">Error</h1>
        <p className="text-subtle mt-2">{error || "Something went wrong"}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-accent text-white rounded-md text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <InvoicesClient 
      initialInvoices={data.invoices} 
      contacts={data.contacts} 
      companies={data.companies} 
      deals={data.deals}
    />
  );
}
