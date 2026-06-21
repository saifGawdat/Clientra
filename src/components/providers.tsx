"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
const AppLoader = dynamic(
  () => import("@/components/app-loader").then((m) => ({ default: m.AppLoader })),
  { ssr: false }
);
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
