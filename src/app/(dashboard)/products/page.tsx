import { Package } from "lucide-react"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function ProductsPage() {
  return (
    <ComingSoon
      title="Products"
      description="Manage your product catalog, pricing, and inventory. Link products to deals and generate accurate quotes instantly."
      icon={Package}
    />
  )
}
