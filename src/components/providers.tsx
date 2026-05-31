"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLoader } from "@/components/app-loader";
import { ConfirmProvider } from "@/components/ui/confirm-modal";
import { ThemeProvider } from "@/providers/theme-provider";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes — CRM data doesn't change every second
        gcTime: 10 * 60 * 1000,   // keep in cache for 10 minutes after unmount
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ConfirmProvider>
          <AppLoader />
          {children}
        </ConfirmProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
