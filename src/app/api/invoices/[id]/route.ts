import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invoiceSchema } from "@/lib/validations"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id, ownerId: session.user.id },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      items: true,
    },
  })

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(invoice)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const { items, ...data } = invoiceSchema.partial().parse(body)

    const invoice = await prisma.invoice.update({
      where: { id, ownerId: session.user.id },
      data: {
        ...data,
        ...(data.issueDate && { issueDate: new Date(data.issueDate) }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        ...(data.contactId !== undefined && { contactId: data.contactId || null }),
        ...(data.companyId !== undefined && { companyId: data.companyId || null }),
        ...(data.dealId !== undefined && { dealId: data.dealId || null }),
        ...(items && {
          items: {
            deleteMany: {},
            create: items,
          },
        }),
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        items: true,
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Invoice update error:", error)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    await prisma.invoice.delete({
      where: { id, ownerId: session.user.id },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Invoice deletion error:", error)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
