import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CompaniesClient } from "@/components/companies/companies-client"

export default async function CompaniesPage() {
  const session = await auth()
  if (!session?.user) return null

  const companies = await prisma.company.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { contacts: true, deals: true } } },
    orderBy: { createdAt: "desc" },
  })

  return <CompaniesClient initialCompanies={companies} />
}
