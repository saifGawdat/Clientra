"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contact, Company, Deal, CRMActivity, Invoice, MaybePaginated } from "@/types/crm-types";

// --- QUERY KEYS ---
export const keys = {
  contacts: {
    all: ["contacts"] as const,
    lists: () => [...keys.contacts.all, "list"] as const,
    detail: (id: string) => [...keys.contacts.all, "detail", id] as const,
  },
  companies: {
    all: ["companies"] as const,
    lists: () => [...keys.companies.all, "list"] as const,
    detail: (id: string) => [...keys.companies.all, "detail", id] as const,
  },
  deals: {
    all: ["deals"] as const,
    lists: () => [...keys.deals.all, "list"] as const,
    detail: (id: string) => [...keys.deals.all, "detail", id] as const,
  },
  activities: {
    all: ["activities"] as const,
    lists: () => [...keys.activities.all, "list"] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    lists: () => [...keys.invoices.all, "list"] as const,
    detail: (id: string) => [...keys.invoices.all, "detail", id] as const,
  },
};

// --- GENERIC MUTATION FACTORY ---
function useOptimisticMutation<T extends { id: string }, TVariables = unknown>(
  queryKey: readonly unknown[],
  mutationFn: (variables: TVariables) => Promise<T | string>,
  updateFn?: (old: T[], variables: TVariables) => T[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous values for all matching queries
      const queries = queryClient.getQueriesData<MaybePaginated<T>>({ queryKey });
      
      if (updateFn) {
        queryClient.setQueriesData<MaybePaginated<T>>({ queryKey }, (old) => {
          if (!old) return old;
          // Handle paginated object structure { data: T[], ... }
          if ("data" in old && Array.isArray(old.data)) {
            return {
              ...old,
              data: updateFn(old.data, newData)
            };
          }
          // Handle flat array structure T[]
          if (Array.isArray(old)) {
            return updateFn(old, newData);
          }
          return old;
        });
      }

      return { queries };
    },
    onError: (err, newData, context) => {
      if (context?.queries) {
        context.queries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// --- CONTACT HOOKS ---
export const useContacts = (initial?: Contact[]) => useQuery({ 
  queryKey: keys.contacts.lists(), 
  queryFn: () => fetch("/api/contacts").then(r => r.json() as Promise<MaybePaginated<Contact>>), 
  initialData: initial,
  staleTime: 60000 
});

export const useCreateContact = () => useOptimisticMutation<Contact>(
  keys.contacts.lists(),
  (data) => fetch("/api/contacts", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, newData) => [{ ...newData, id: Math.random().toString(), createdAt: new Date() }, ...old]
);

export const useUpdateContact = () => useOptimisticMutation<Contact>(
  keys.contacts.lists(),
  ({ id, data }) => fetch(`/api/contacts/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, { id, data }) => old.map(i => i.id === id ? { ...i, ...data } : i)
);

export const useDeleteContact = () => useOptimisticMutation<Contact>(
  keys.contacts.lists(),
  (id) => fetch(`/api/contacts/${id}`, { method: "DELETE" }).then(() => id),
  (old, id) => old.filter(i => i.id !== id)
);

// --- COMPANY HOOKS ---
export const useCompanies = (initial?: Company[]) => useQuery({ 
  queryKey: keys.companies.lists(), 
  queryFn: () => fetch("/api/companies").then(r => r.json() as Promise<MaybePaginated<Company>>), 
  initialData: initial 
});

export const useCreateCompany = () => useOptimisticMutation<Company>(
  keys.companies.lists(),
  (data) => fetch("/api/companies", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, newData) => [{ ...newData, id: Math.random().toString() }, ...old]
);

export const useUpdateCompany = () => useOptimisticMutation<Company>(
  keys.companies.lists(),
  ({ id, data }) => fetch(`/api/companies/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, { id, data }) => old.map(i => i.id === id ? { ...i, ...data } : i)
);

export const useDeleteCompany = () => useOptimisticMutation<Company>(
  keys.companies.lists(),
  (id) => fetch(`/api/companies/${id}`, { method: "DELETE" }).then(() => id),
  (old, id) => old.filter(i => i.id !== id)
);

// --- DEAL HOOKS ---
export const useDeals = (initial?: Deal[]) => useQuery({ 
  queryKey: keys.deals.lists(), 
  queryFn: () => fetch("/api/deals").then(r => r.json() as Promise<MaybePaginated<Deal>>), 
  initialData: initial 
});

export const useCreateDeal = () => useOptimisticMutation<Deal>(
  keys.deals.lists(),
  (data) => fetch("/api/deals", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, newData) => [{ ...newData, id: Math.random().toString(), createdAt: new Date() }, ...old]
);

export const useUpdateDeal = () => useOptimisticMutation<Deal>(
  keys.deals.lists(),
  ({ id, data }) => fetch(`/api/deals/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, { id, data }) => old.map(i => i.id === id ? { ...i, ...data } : i)
);

export const useDeleteDeal = () => useOptimisticMutation<Deal>(
  keys.deals.lists(),
  (id) => fetch(`/api/deals/${id}`, { method: "DELETE" }).then(() => id),
  (old, id) => old.filter(i => i.id !== id)
);

// --- ACTIVITY HOOKS ---
export const useActivities = (initial?: CRMActivity[]) => useQuery({ 
  queryKey: keys.activities.lists(), 
  queryFn: () => fetch("/api/activities").then(r => r.json() as Promise<MaybePaginated<CRMActivity>>), 
  initialData: initial 
});

export const useCreateActivity = () => useOptimisticMutation<CRMActivity>(
  keys.activities.lists(),
  (data) => fetch("/api/activities", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, newData) => [{ ...newData, id: Math.random().toString(), createdAt: new Date() }, ...old]
);

export const useUpdateActivity = () => useOptimisticMutation<CRMActivity>(
  keys.activities.lists(),
  ({ id, data }) => fetch(`/api/activities/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, { id, data }) => old.map(i => i.id === id ? { ...i, ...data } : i)
);

export const useDeleteActivity = () => useOptimisticMutation<CRMActivity>(
  keys.activities.lists(),
  (id) => fetch(`/api/activities/${id}`, { method: "DELETE" }).then(() => id),
  (old, id) => old.filter(i => i.id !== id)
);

// --- INVOICE HOOKS ---
export const useInvoices = (initial?: Invoice[]) => useQuery({ 
  queryKey: keys.invoices.lists(), 
  queryFn: () => fetch("/api/invoices").then(r => r.json() as Promise<MaybePaginated<Invoice>>), 
  initialData: initial 
});

export const useCreateInvoice = () => useOptimisticMutation<Invoice>(
  keys.invoices.lists(),
  (data) => fetch("/api/invoices", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, newData) => [{ ...newData, id: Math.random().toString(), createdAt: new Date() }, ...old]
);

export const useUpdateInvoice = () => useOptimisticMutation<Invoice>(
  keys.invoices.lists(),
  ({ id, data }) => fetch(`/api/invoices/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json()),
  (old, { id, data }) => old.map(i => i.id === id ? { ...i, ...data } : i)
);

export const useDeleteInvoice = () => useOptimisticMutation<Invoice>(
  keys.invoices.lists(),
  (id) => fetch(`/api/invoices/${id}`, { method: "DELETE" }).then(() => id),
  (old, id) => old.filter(i => i.id !== id)
);
