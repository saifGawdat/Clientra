import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(["TARGET", "LEAD", "PROSPECT", "CUSTOMER", "CHURNED", "INACTIVE"]),
  source: z.enum(["WEBSITE", "REFERRAL", "SOCIAL", "EMAIL", "COLD_CALL", "EVENT", "OTHER"]),
  companyId: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: z.union([z.string().url("Invalid URL"), z.literal("")]).optional(),
  industry: z.string().optional(),
  size: z.enum(["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).or(z.literal("")).optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

export const dealSchema = z.object({
  title: z.string().min(1, "Deal title is required"),
  value: z.number().optional(),
  currency: z.string(),
  stage: z.enum(["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  probability: z.number().min(0).max(100).optional(),
  closeDate: z.string().optional(),
  description: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
})

export const activitySchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "TASK", "NOTE"]),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  scheduledAt: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
})

export const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty"),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  companyId: z.string().optional(),
})

export const invoiceItemSchema = z.object({
  service: z.string().min(1, "Service name is required"),
  price: z.number().min(0, "Price must be positive"),
})

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  amount: z.number().min(0),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
  issueDate: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one service is required"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type CompanyInput = z.infer<typeof companySchema>
export type DealInput = z.infer<typeof dealSchema>
export type ActivityInput = z.infer<typeof activitySchema>
export type NoteInput = z.infer<typeof noteSchema>
export type InvoiceInput = z.infer<typeof invoiceSchema>
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>
