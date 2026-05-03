import { useQuery } from "@tanstack/react-query";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  [key: string]: any; // For secondary data like contacts, companies, etc.
}

export function usePaginatedQuery<T>(
  queryKey: readonly any[],
  url: string,
  params: Record<string, any> = {}
) {
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
  });
}
