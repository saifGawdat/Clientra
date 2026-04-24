"use client";

import { AppLoader } from "@/components/app-loader";
import { ConfirmProvider } from "@/components/ui/confirm-modal";
import { ThemeProvider } from "@/providers/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConfirmProvider>
        <AppLoader />
        {children}
      </ConfirmProvider>
    </ThemeProvider>
  );
}
