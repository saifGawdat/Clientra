import { z } from "zod"

const optionalString = z.string().optional()
const optionalUrl = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().url("Invalid URL").optional(),
)
const optionalEmail = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().email("Invalid email").optional(),
)
const optionalId = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().optional(),
)

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
  email: optionalEmail,
  phone: optionalString,
  title: optionalString,
  status: z.enum(["TARGET", "LEAD", "PROSPECT", "CUSTOMER", "CHURNED", "INACTIVE"]),
  source: z.enum(["WEBSITE", "REFERRAL", "SOCIAL", "EMAIL", "COLD_CALL", "EVENT", "OTHER"]),
  companyId: optionalId,
  tags: z.array(z.string()).optional(),
})

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: optionalUrl,
  industry: optionalString,
  size: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional(),
  ),
  phone: optionalString,
  email: optionalEmail,
  address: optionalString,
  city: optionalString,
  country: optionalString,
})

export const dealSchema = z.object({
  title: z.string().min(1, "Deal title is required"),
  value: z.number().optional(),
  currency: z.string(),
  stage: z.enum(["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  probability: z.number().min(0).max(100).optional(),
  closeDate: optionalString,
  description: optionalString,
  contactId: optionalId,
  companyId: optionalId,
})

export const activitySchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "TASK", "NOTE"]),
  subject: z.string().min(1, "Subject is required"),
  description: optionalString,
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  scheduledAt: optionalString,
  contactId: optionalId,
  dealId: optionalId,
})

export const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty"),
  contactId: optionalId,
  dealId: optionalId,
  companyId: optionalId,
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type CompanyInput = z.infer<typeof companySchema>
export type DealInput = z.infer<typeof dealSchema>
export type ActivityInput = z.infer<typeof activitySchema>
export type NoteInput = z.infer<typeof noteSchema>
