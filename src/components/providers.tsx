"use client"

import { AppLoader } from "@/components/app-loader"
import { ConfirmProvider } from "@/components/ui/confirm-modal"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <AppLoader />
      {children}
    </ConfirmProvider>
  )
}
