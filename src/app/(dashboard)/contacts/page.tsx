import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ContactsClient } from "@/components/contacts/contacts-client"

export default async function ContactsPage() {
  const session = await auth()
  if (!session?.user) return null

  const [contacts, companies] = await Promise.all([
    prisma.contact.findMany({
      where: { ownerId: session.user.id },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.company.findMany({
      where: { ownerId: session!.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return <ContactsClient initialContacts={contacts} companies={companies} />
}
