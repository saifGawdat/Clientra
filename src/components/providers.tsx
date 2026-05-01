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
        staleTime: 60 * 1000, // 1 minute
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
