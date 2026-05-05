export type UserRole = "ADMIN" | "MEMBER";
export type ContactStatus = "TARGET" | "LEAD" | "PROSPECT" | "CUSTOMER" | "CHURNED" | "INACTIVE";
export type ContactSource = "WEBSITE" | "REFERRAL" | "SOCIAL" | "EMAIL" | "COLD_CALL" | "EVENT" | "OTHER";
export type CompanySize = "SOLO" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";
export type DealStage = "LEAD" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
export type ActivityType = "CALL" | "EMAIL" | "MEETING" | "TASK" | "NOTE";
export type ActivityStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Company {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  size?: CompanySize | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  logo?: string | null;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    contacts?: number;
    deals?: number;
    invoices?: number;
  };
  invoices?: Invoice[];
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  status: ContactStatus;
  source: ContactSource;
  tags: string[];
  avatar?: string | null;
  companyId?: string | null;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  company?: Partial<Company> | null;
  deals?: Deal[];
  activities?: CRMActivity[];
  notes?: Note[];
  invoices?: Invoice[];
}

export interface Deal {
  id: string;
  title: string;
  value?: number | null;
  currency: string;
  stage: DealStage;
  probability?: number | null;
  closeDate?: Date | string | null;
  description?: string | null;
  contactId?: string | null;
  companyId?: string | null;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  contact?: Partial<Contact> | null;
  company?: Partial<Company> | null;
  activities?: CRMActivity[];
  notes?: Note[];
  invoices?: Invoice[];
}

export interface CRMActivity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string | null;
  status: ActivityStatus;
  scheduledAt?: Date | string | null;
  completedAt?: Date | string | null;
  contactId?: string | null;
  dealId?: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  contact?: Partial<Contact> | null;
  deal?: Partial<Deal> | null;
}

export interface Note {
  id: string;
  content: string;
  contactId?: string | null;
  dealId?: string | null;
  companyId?: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: Date | string;
  dueDate: Date | string;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  contact?: Partial<Contact> | null;
  company?: Partial<Company> | null;
  deal?: Partial<Deal> | null;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  service: string;
  price: number;
  invoiceId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  contacts?: Contact[];
  companies?: Company[];
  deals?: Deal[];
  leads?: Contact[];
  targets?: Contact[];
  activities?: CRMActivity[];
  invoices?: Invoice[];
}

export type MaybePaginated<T> = T[] | PaginatedResponse<T>;
