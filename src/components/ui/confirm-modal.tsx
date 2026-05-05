"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null)

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      setResolver({ resolve })
    })
  }

  const handleConfirm = () => {
    setIsOpen(false)
    resolver?.resolve(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolver?.resolve(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) handleCancel()
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{options?.title}</DialogTitle>
            {options?.description && (
              <DialogDescription>{options.description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              {options?.cancelText || "Cancel"}
            </Button>
            <Button
              variant={options?.variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
              className={
                options?.variant === "destructive"
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all"
                  : "shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-all"
              }
            >
              {options?.confirmText || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider")
  }
  return context.confirm
}
