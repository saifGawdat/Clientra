import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PaginatedResponse } from "@/types/crm-types";

export function usePaginatedQuery<T>(
  queryKey: readonly unknown[],
  url: string,
  params: Record<string, unknown> = {}
): ReturnType<typeof useQuery<PaginatedResponse<T>>> {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });

      const res = await fetch(`${url}?${searchParams.toString()}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || error.error || "Failed to fetch data");
      }
      return res.json() as Promise<PaginatedResponse<T>>;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
