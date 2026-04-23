import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ContactDetail } from "@/components/contacts/contact-detail"

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  const [contact, companies] = await Promise.all([
    prisma.contact.findFirst({
      where: { id, ownerId: session!.user.id },
      include: {
        company: true,
        deals: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" }, take: 10 },
        notes: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.company.findMany({
      where: { ownerId: session!.user.id },
      select: { id: true, name: true },
    }),
  ])

  if (!contact) notFound()

  return <ContactDetail contact={contact} companies={companies} />
}
