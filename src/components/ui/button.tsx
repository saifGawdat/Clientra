import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-linear-to-r from-violet-600 to-violet-500 text-white hover:from-violet-700 hover:to-violet-600 shadow-sm shadow-violet-900/30",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-border bg-transparent hover:bg-surface text-muted hover:text-foreground",
        secondary: "bg-surface text-muted hover:bg-surface-raised hover:text-foreground",
        ghost: "hover:bg-surface text-muted hover:text-foreground",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-7 px-3 py-1 text-xs",
        sm: "h-6 rounded-md px-2.5 text-xs",
        lg: "h-8 rounded-lg px-5 text-sm",
        icon: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
