"use client"

import { AppLoader } from "@/components/app-loader"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppLoader />
      {children}
    </>
  )
}
