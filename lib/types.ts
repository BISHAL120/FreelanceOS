export type UserRole = 'ADMIN' | 'LEAD_GEN' | 'DEVELOPER'

export type ClientStatus = 'LEAD' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
export type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATING' | 'WON' | 'LOST'
export type LeadActivityType = 'NOTE' | 'MESSAGE_SENT' | 'REPLY_RECEIVED' | 'FOLLOW_UP' | 'CALL'
export type LeadActivityChannel = 'WhatsApp' | 'Telegram' | 'LinkedIn' | 'Messenger' | 'Email' | 'Phone' | 'Other'
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'REVIEW' | 'COMPLETED' | 'PAUSED'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type IssueType = 'BUG' | 'FEATURE_REQUEST' | 'FEEDBACK' | 'QUESTION'
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string | null
  title?: string | null
  hourlyRate?: number
  createdAt: string
  updatedAt?: string
}

export interface Client {
  id: string
  name: string
  companyName: string | null
  email: string
  phone: string | null
  website: string | null
  status: ClientStatus
  defaultRate: number
  budget: number
  industry: string | null
  address: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  // relations
  projects?: Project[]
  invoices?: Invoice[]
  tasks?: Task[]
  timeEntries?: TimeEntry[]
}

export interface LeadActivity {
  id: string
  leadId: string
  type: LeadActivityType
  channel?: LeadActivityChannel | null
  title: string
  content: string
  imageUrl?: string | null
  authorName: string
  authorId?: string | null
  createdAt: string
}

export interface Lead {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  dealValue: number
  stage: LeadStage
  source: string | null
  notes: string | null
  nextFollowUp: string | null
  convertedClientId: string | null
  assignedToId?: string | null
  assignedToName?: string | null
  activities?: LeadActivity[]
  createdAt: string
  updatedAt: string
}

export type ProjectBillingType = 'FIXED' | 'HOURLY'
export type MilestoneStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED'
export type MilestonePaymentStatus = 'UNPAID' | 'INVOICED' | 'PAID'

export interface ProjectMilestone {
  id: string
  projectId: string
  title: string
  description?: string | null
  amount: number
  percentage?: number | null
  dueDate?: string | null
  status: MilestoneStatus
  paymentStatus: MilestonePaymentStatus
  paidAt?: string | null
  paidAmount: number
  paymentMethod?: string | null
  paymentNote?: string | null
  order: number
  tasks?: Task[]
  createdAt: string
  updatedAt: string
}

export interface ProjectTeamMember {
  userId: string
  userName: string
  userEmail?: string
  userAvatar?: string | null
  roleOnProject?: string
  hourlyRate?: number
}

export interface Project {
  id: string
  title: string
  description: string | null
  status: ProjectStatus
  billingType: ProjectBillingType
  hourlyRate?: number | null
  budget: number
  spent: number
  progress: number
  downpaymentPercent?: number | null
  downpaymentAmount?: number | null
  downpaymentPaid?: boolean
  downpaymentPaidAt?: string | null
  downpaymentMethod?: string | null
  downpaymentNote?: string | null
  startDate: string | null
  endDate: string | null
  clientId: string
  clientName?: string
  assignedUserIds?: string[]
  assignedUserNames?: string[]
  teamMembers?: ProjectTeamMember[]
  milestones?: ProjectMilestone[]
  createdAt: string
  updatedAt: string
  tasks?: Task[]
  timeEntries?: TimeEntry[]
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  startedAt?: string | null
  completedAt?: string | null
  estimatedHours: number
  actualHours: number
  projectId: string | null
  projectTitle?: string
  milestoneId?: string | null
  milestoneTitle?: string | null
  clientId: string | null
  clientName?: string
  assignedToId?: string | null
  assignedToName?: string | null
  order?: number
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  description: string
  durationMinutes: number
  hourlyRate: number
  billable: boolean
  date: string
  projectId: string | null
  projectTitle?: string
  clientId: string | null
  clientName?: string
  userId?: string | null
  userName?: string | null
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  invoiceId?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  notes: string | null
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  paidAt: string | null
  clientId: string
  clientName?: string
  projectId: string | null
  projectTitle?: string
  items: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

export interface Issue {
  id: string
  title: string
  description: string
  type: IssueType
  severity: IssueSeverity
  status: IssueStatus
  clientId: string | null
  clientName?: string
  projectId: string | null
  projectTitle?: string
  createdAt: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId?: string | null
  details?: string | null
  createdAt: string
}

export interface DashboardMetrics {
  totalRevenue: number
  revenueThisMonth: number
  activeClientsCount: number
  activeProjectsCount: number
  openTasksCount: number
  unbilledHours: number
  unbilledAmount: number
  pipelineValue: number
  monthlyRevenueData: { month: string; revenue: number; billed: number }[]
  recentActivities: ActivityLog[]
  urgentTasks: Task[]
  ongoingProjects: Project[]
  // Role-specific stats
  role?: UserRole
  myAssignedTasksCount?: number
  myAssignedProjectsCount?: number
  totalLeadsCount?: number
}
