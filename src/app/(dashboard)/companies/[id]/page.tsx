import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CompanyDetail } from "@/components/companies/company-detail"

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  const company = await prisma.company.findFirst({
    where: { id, ownerId: session!.user.id },
    include: {
      contacts: { take: 20, orderBy: { createdAt: "desc" } },
      deals: { take: 20, orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!company) notFound()

  return <CompanyDetail company={company} />
}
