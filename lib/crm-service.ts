import { prisma } from './prisma'
import type {
  User,
  UserRole,
  Client,
  Lead,
  LeadActivity,
  Project,
  ProjectBillingType,
  MilestoneStatus,
  MilestonePaymentStatus,
  ProjectMilestone,
  ProjectTeamMember,
  Task,
  TaskStatus,
  TimeEntry,
  Invoice,
  Issue,
  ActivityLog,
  DashboardMetrics,
} from './types'

// Initial team members (RBAC)
let memoryUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Bishal (Owner)',
    email: 'bishal@agency.dev',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Agency Founder & Lead Engineer',
    hourlyRate: 150,
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
  },
  {
    id: 'usr-2',
    name: 'Elena Vance',
    email: 'elena.v@agency.dev',
    role: 'LEAD_GEN',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Generation Specialist',
    hourlyRate: 65,
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
  {
    id: 'usr-3',
    name: 'Devon Miller',
    email: 'devon.m@agency.dev',
    role: 'DEVELOPER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Full-Stack Developer',
    hourlyRate: 95,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'usr-4',
    name: 'Liam Chen',
    email: 'liam.c@agency.dev',
    role: 'DEVELOPER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Frontend & UI Engineer',
    hourlyRate: 85,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
]

// Lead Activities (Follow-up messages, replies, notes, screenshots)
let memoryLeadActivities: LeadActivity[] = [
  {
    id: 'act-lead-1',
    leadId: 'lead-1',
    type: 'MESSAGE_SENT',
    title: 'Milestone Proposal v2 Sent',
    content: 'Sent revised scope with 2-phase delivery structure for the solar savings visualizer.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    authorName: 'Elena Vance',
    authorId: 'usr-2',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'act-lead-2',
    leadId: 'lead-1',
    type: 'REPLY_RECEIVED',
    title: 'Client Response Received',
    content: 'Julian replied: "Looks great, team is reviewing the payment schedule. Will finalize by Friday."',
    imageUrl: null,
    authorName: 'Julian Ramirez',
    authorId: null,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'act-lead-3',
    leadId: 'lead-2',
    type: 'CALL',
    title: 'Discovery & Tech Architecture Call',
    content: 'Discussed API ingestion rate and carrier GPS feeds. Estimated 120 hrs total development effort.',
    imageUrl: null,
    authorName: 'Elena Vance',
    authorId: 'usr-2',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

// Initial realistic freelancer data
let memoryClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Sarah Jenkins',
    companyName: 'Northstar Ventures',
    email: 'sarah@northstar.io',
    phone: '+1 (555) 234-5678',
    website: 'https://northstar.io',
    status: 'ACTIVE',
    defaultRate: 140,
    budget: 15000,
    industry: 'Fintech & Venture',
    address: 'San Francisco, CA',
    notes: 'Key retainer client. Monthly advisory and web app development.',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-2',
    name: 'Marcus Chen',
    companyName: 'Aster Digital',
    email: 'marcus@asterdigital.co',
    phone: '+1 (555) 876-5432',
    website: 'https://asterdigital.co',
    status: 'ACTIVE',
    defaultRate: 150,
    budget: 9500,
    industry: 'Creative Agency',
    address: 'New York, NY',
    notes: 'Bi-weekly sprints on their client portal and automated billing.',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-3',
    name: 'Elena Rostova',
    companyName: 'Blue Finch Commerce',
    email: 'elena@bluefinch.com',
    phone: '+1 (555) 345-9876',
    website: 'https://bluefinch.com',
    status: 'ACTIVE',
    defaultRate: 135,
    budget: 12000,
    industry: 'E-commerce',
    address: 'Austin, TX',
    notes: 'Headless Shopify architecture and custom React integrations.',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-4',
    name: 'David Vance',
    companyName: 'Apex Health Systems',
    email: 'david.vance@apexhealth.org',
    phone: '+1 (555) 432-1100',
    website: 'https://apexhealth.org',
    status: 'COMPLETED',
    defaultRate: 160,
    budget: 8000,
    industry: 'Healthcare Tech',
    address: 'Boston, MA',
    notes: 'HIPAA compliant dashboard delivered on schedule.',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let memoryLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Julian Ramirez',
    company: 'Solaria Solar Solutions',
    email: 'julian@solariasolar.com',
    phone: '+1 (555) 901-2233',
    dealValue: 6500,
    stage: 'PROPOSAL_SENT',
    source: 'Referral (Sarah Jenkins)',
    notes: 'Needs client quoting engine and solar savings visualizer.',
    nextFollowUp: new Date(Date.now() + 2 * 86400000).toISOString(),
    convertedClientId: null,
    assignedToId: 'usr-2',
    assignedToName: 'Elena Vance',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-2',
    name: 'Amara Okafor',
    company: 'Kora Logistics',
    email: 'amara@koralogistics.io',
    phone: '+1 (555) 678-9900',
    dealValue: 12000,
    stage: 'NEGOTIATING',
    source: 'Twitter / X',
    notes: 'Real-time carrier tracking dashboard. Discussing 3-month milestone schedule.',
    nextFollowUp: new Date(Date.now() + 1 * 86400000).toISOString(),
    convertedClientId: null,
    assignedToId: 'usr-2',
    assignedToName: 'Elena Vance',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-3',
    name: 'Thomas Wright',
    company: 'Beacon Studio',
    email: 'thomas@beaconstudio.design',
    phone: '+1 (555) 443-8822',
    dealValue: 4200,
    stage: 'QUALIFIED',
    source: 'Cold Outreach',
    notes: 'Interactive showcase portfolio with custom Three.js canvas shaders.',
    nextFollowUp: new Date(Date.now() + 4 * 86400000).toISOString(),
    convertedClientId: null,
    assignedToId: 'usr-2',
    assignedToName: 'Elena Vance',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-4',
    name: 'Chloe Bennett',
    company: 'Veloce Mobility',
    email: 'chloe@velocemobility.com',
    phone: '+1 (555) 321-9988',
    dealValue: 8500,
    stage: 'NEW',
    source: 'LinkedIn Inbound',
    notes: 'Fleet booking calendar & driver mobile onboarding checklist.',
    nextFollowUp: new Date(Date.now() + 3 * 86400000).toISOString(),
    convertedClientId: null,
    assignedToId: 'usr-2',
    assignedToName: 'Elena Vance',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let memoryMilestones: ProjectMilestone[] = [
  {
    id: 'mls-1',
    projectId: 'prj-1',
    title: 'Upfront Deposit (20%)',
    description: 'Initial project kickoff deposit upon contract execution.',
    amount: 1240,
    percentage: 20,
    dueDate: '2026-06-15T00:00:00.000Z',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paidAt: '2026-06-14T14:30:00.000Z',
    paidAmount: 1240,
    paymentMethod: 'Stripe',
    paymentNote: 'Payment confirmed via invoice #INV-2026-001',
    order: 1,
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mls-2',
    projectId: 'prj-1',
    title: 'Milestone 1: Navigation Architecture & Token System',
    description: 'Information architecture, responsive sidebar, and design token foundation.',
    amount: 2480,
    percentage: 40,
    dueDate: '2026-07-20T00:00:00.000Z',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paidAt: '2026-07-22T09:15:00.000Z',
    paidAmount: 2480,
    paymentMethod: 'Bank Wire',
    paymentNote: 'Wire transfer confirmed (ref #NW-9842)',
    order: 2,
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mls-3',
    projectId: 'prj-1',
    title: 'Milestone 2: Real-time Activity Ledger & Release',
    description: 'Live activity streams, testing, staging signoff, and production deployment.',
    amount: 2480,
    percentage: 40,
    dueDate: '2026-09-30T00:00:00.000Z',
    status: 'IN_PROGRESS',
    paymentStatus: 'UNPAID',
    paidAt: null,
    paidAmount: 0,
    paymentMethod: null,
    paymentNote: null,
    order: 3,
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mls-4',
    projectId: 'prj-2',
    title: 'Upfront Downpayment (25%)',
    description: 'Initial deposit to secure developer sprint reservation.',
    amount: 1200,
    percentage: 25,
    dueDate: '2026-07-02T00:00:00.000Z',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paidAt: '2026-07-02T11:00:00.000Z',
    paidAmount: 1200,
    paymentMethod: 'Wise',
    paymentNote: 'Wise business transfer received',
    order: 1,
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mls-5',
    projectId: 'prj-2',
    title: 'Milestone 1: PDF Generation Engine & Remittance Logic',
    description: 'Dynamic PDF template formatting, auto-numbering, and tax calculations.',
    amount: 1800,
    percentage: 37.5,
    dueDate: '2026-08-15T00:00:00.000Z',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paidAt: '2026-08-18T16:20:00.000Z',
    paidAmount: 1800,
    paymentMethod: 'Stripe',
    paymentNote: 'Credit card transaction tx_839219',
    order: 2,
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mls-6',
    projectId: 'prj-2',
    title: 'Milestone 2: Webhooks, Automated Email & Client Portal Integration',
    description: 'Stripe invoice webhooks, automated receipt dispatch, and portal download.',
    amount: 1800,
    percentage: 37.5,
    dueDate: '2026-10-15T00:00:00.000Z',
    status: 'IN_PROGRESS',
    paymentStatus: 'UNPAID',
    paidAt: null,
    paidAmount: 0,
    paymentMethod: null,
    paymentNote: null,
    order: 3,
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let memoryProjects: Project[] = [
  {
    id: 'prj-1',
    title: 'Client Portal & CRM Navigation Revamp',
    description: 'Rework client navigation layout, refine design tokens, and implement real-time activity ledger.',
    status: 'ACTIVE',
    billingType: 'FIXED',
    budget: 6200,
    spent: 3720,
    progress: 65,
    downpaymentPercent: 20,
    downpaymentAmount: 1240,
    downpaymentPaid: true,
    downpaymentPaidAt: '2026-06-14T14:30:00.000Z',
    downpaymentMethod: 'Stripe',
    downpaymentNote: '20% upfront deposit received on contract signing.',
    startDate: '2026-06-12T00:00:00.000Z',
    endDate: '2026-09-30T00:00:00.000Z',
    clientId: 'cli-1',
    clientName: 'Northstar Ventures',
    assignedUserIds: ['usr-3'],
    assignedUserNames: ['Devon Miller'],
    teamMembers: [
      { userId: 'usr-3', userName: 'Devon Miller', roleOnProject: 'Lead Full-Stack Engineer', hourlyRate: 95 }
    ],
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prj-2',
    title: 'Billing Automation & PDF Invoicing',
    description: 'Automated invoice generation rules, line item calculations, and client remittance checkpoints.',
    status: 'ACTIVE',
    billingType: 'FIXED',
    budget: 4800,
    spent: 3000,
    progress: 55,
    downpaymentPercent: 25,
    downpaymentAmount: 1200,
    downpaymentPaid: true,
    downpaymentPaidAt: '2026-07-02T11:00:00.000Z',
    downpaymentMethod: 'Wise',
    downpaymentNote: '25% upfront downpayment cleared.',
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-10-15T00:00:00.000Z',
    clientId: 'cli-2',
    clientName: 'Aster Digital',
    assignedUserIds: ['usr-3', 'usr-4'],
    assignedUserNames: ['Devon Miller', 'Liam Chen'],
    teamMembers: [
      { userId: 'usr-3', userName: 'Devon Miller', roleOnProject: 'Backend & Architecture', hourlyRate: 95 },
      { userId: 'usr-4', userName: 'Liam Chen', roleOnProject: 'Frontend PDF Template Developer', hourlyRate: 80 }
    ],
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prj-3',
    title: 'Storefront Optimization & Headless Cart',
    description: 'Sub-second checkout flow, Algolia search integration, and mobile UX tuning.',
    status: 'REVIEW',
    billingType: 'HOURLY',
    hourlyRate: 125,
    budget: 7500,
    spent: 6800,
    progress: 90,
    startDate: '2026-07-15T00:00:00.000Z',
    endDate: '2026-09-18T00:00:00.000Z',
    clientId: 'cli-3',
    clientName: 'Blue Finch Commerce',
    assignedUserIds: ['usr-4'],
    assignedUserNames: ['Liam Chen'],
    teamMembers: [
      { userId: 'usr-4', userName: 'Liam Chen', roleOnProject: 'Performance & Frontend Specialist', hourlyRate: 85 }
    ],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let memoryTasks: Task[] = [
  {
    id: 'tsk-1',
    title: 'Finalize invoice preview print layout & styling',
    description: 'Ensure clean page-breaks, crisp typography, and currency symbols.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    startedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    estimatedHours: 4,
    actualHours: 2.5,
    projectId: 'prj-2',
    projectTitle: 'Billing Automation & PDF Invoicing',
    clientId: 'cli-2',
    clientName: 'Aster Digital',
    assignedToId: 'usr-3',
    assignedToName: 'Devon Miller',
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tsk-2',
    title: 'Optimize product list re-renders on mobile filter touch',
    description: 'Add useMemo and virtualization on large catalogs.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    estimatedHours: 3,
    actualHours: 0,
    projectId: 'prj-3',
    projectTitle: 'Storefront Optimization & Headless Cart',
    clientId: 'cli-3',
    clientName: 'Blue Finch Commerce',
    assignedToId: 'usr-4',
    assignedToName: 'Liam Chen',
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tsk-3',
    title: 'Send Solaria Solar Solutions revised milestone proposal',
    description: 'Incorporate Julian’s requested 2-phase delivery and updated pricing.',
    status: 'TODO',
    priority: 'URGENT',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    estimatedHours: 1.5,
    actualHours: 0,
    projectId: null,
    clientId: null,
    assignedToId: 'usr-2',
    assignedToName: 'Elena Vance',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tsk-4',
    title: 'Wire up live time-tracker play/pause trigger with session log',
    description: 'Connect header stopwatch widget with active time log mutation.',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    startedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    estimatedHours: 2,
    actualHours: 2,
    projectId: 'prj-1',
    projectTitle: 'Client Portal & CRM Navigation Revamp',
    clientId: 'cli-1',
    clientName: 'Northstar Ventures',
    assignedToId: 'usr-3',
    assignedToName: 'Devon Miller',
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tsk-5',
    title: 'Client monthly check-in call preparation',
    description: 'Review Q3 roadmap and feature priorities with Sarah.',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    estimatedHours: 1,
    actualHours: 0,
    projectId: 'prj-1',
    projectTitle: 'Client Portal & CRM Navigation Revamp',
    clientId: 'cli-1',
    clientName: 'Northstar Ventures',
    assignedToId: 'usr-2',
    assignedToName: 'Elena Vance',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let memoryTimeEntries: TimeEntry[] = [
  {
    id: 'tim-1',
    description: 'Dashboard metric cards hierarchy and spacing polish',
    durationMinutes: 150,
    hourlyRate: 140,
    billable: true,
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    projectId: 'prj-1',
    projectTitle: 'Client Portal & CRM Navigation Revamp',
    clientId: 'cli-1',
    clientName: 'Northstar Ventures',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tim-2',
    description: 'Invoice template line-item calculations and tests',
    durationMinutes: 180,
    hourlyRate: 150,
    billable: true,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    projectId: 'prj-2',
    projectTitle: 'Billing Automation & PDF Invoicing',
    clientId: 'cli-2',
    clientName: 'Aster Digital',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tim-3',
    description: 'Checkout performance audit and Lighthouse tuning',
    durationMinutes: 105,
    hourlyRate: 135,
    billable: true,
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    projectId: 'prj-3',
    projectTitle: 'Storefront Optimization & Headless Cart',
    clientId: 'cli-3',
    clientName: 'Blue Finch Commerce',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let memoryInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    issueDate: '2026-08-01T00:00:00.000Z',
    dueDate: '2026-08-15T00:00:00.000Z',
    status: 'PAID',
    notes: 'Thank you for your business! Paid via Wire Transfer.',
    subtotal: 3500,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 3500,
    paidAt: '2026-08-14T10:00:00.000Z',
    clientId: 'cli-1',
    clientName: 'Northstar Ventures',
    projectId: 'prj-1',
    projectTitle: 'Client Portal & CRM Navigation Revamp',
    items: [
      { id: 'item-1', description: 'Sprint 1 - Navigation layout refactor', quantity: 15, unitPrice: 140, amount: 2100 },
      { id: 'item-2', description: 'Sprint 2 - Activity feed architecture', quantity: 10, unitPrice: 140, amount: 1400 },
    ],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    issueDate: '2026-08-20T00:00:00.000Z',
    dueDate: '2026-09-05T00:00:00.000Z',
    status: 'SENT',
    notes: 'Net 15 payment terms. Please remit to standard business account.',
    subtotal: 2400,
    taxRate: 5,
    taxAmount: 120,
    discount: 0,
    total: 2520,
    paidAt: null,
    clientId: 'cli-2',
    clientName: 'Aster Digital',
    projectId: 'prj-2',
    projectTitle: 'Billing Automation & PDF Invoicing',
    items: [
      { id: 'item-3', description: 'Billing automation core engine & schemas', quantity: 16, unitPrice: 150, amount: 2400 },
    ],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-003',
    issueDate: '2026-09-01T00:00:00.000Z',
    dueDate: '2026-09-20T00:00:00.000Z',
    status: 'DRAFT',
    notes: 'Milestone 2 deliverable invoice.',
    subtotal: 4200,
    taxRate: 0,
    taxAmount: 0,
    discount: 200,
    total: 4000,
    paidAt: null,
    clientId: 'cli-3',
    clientName: 'Blue Finch Commerce',
    projectId: 'prj-3',
    projectTitle: 'Storefront Optimization & Headless Cart',
    items: [
      { id: 'item-4', description: 'Headless cart development & testing', quantity: 28, unitPrice: 150, amount: 4200 },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let memoryIssues: Issue[] = [
  {
    id: 'iss-1',
    title: 'Client detail panel loses scroll position on tab switch',
    description: 'When toggling between Projects and Invoices tabs, scroll jumps to top.',
    type: 'BUG',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    clientId: 'cli-1',
    clientName: 'Northstar Ventures',
    projectId: 'prj-1',
    projectTitle: 'Client Portal & CRM Navigation Revamp',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'iss-2',
    title: 'Need CSV export for monthly client timesheet report',
    description: 'Sarah requested an exportable CSV summary to share with Northstar finance.',
    type: 'FEATURE_REQUEST',
    severity: 'MEDIUM',
    status: 'OPEN',
    clientId: 'cli-1',
    clientName: 'Northstar Ventures',
    projectId: 'prj-1',
    projectTitle: 'Client Portal & CRM Navigation Revamp',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'iss-3',
    title: 'Cart subtotal precision issue on fractional currency conversion',
    description: 'Minor rounding variation when euro rates are converted to USD.',
    type: 'BUG',
    severity: 'CRITICAL',
    status: 'RESOLVED',
    clientId: 'cli-3',
    clientName: 'Blue Finch Commerce',
    projectId: 'prj-3',
    projectTitle: 'Storefront Optimization & Headless Cart',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let memoryActivities: ActivityLog[] = [
  {
    id: 'act-1',
    action: 'Invoice Created',
    entityType: 'INVOICE',
    entityId: 'inv-3',
    details: 'Drafted INV-2026-003 for Blue Finch Commerce ($4,000.00)',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'act-2',
    action: 'Time Logged',
    entityType: 'TIME_ENTRY',
    entityId: 'tim-1',
    details: '2.5 hrs logged on Client Portal & CRM Navigation Revamp',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'act-3',
    action: 'Task Completed',
    entityType: 'TASK',
    entityId: 'tsk-4',
    details: 'Live time-tracker play/pause trigger marked Done',
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    id: 'act-4',
    action: 'Lead Updated',
    entityType: 'LEAD',
    entityId: 'lead-2',
    details: 'Kora Logistics moved to NEGOTIATING stage ($12,000.00)',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
]

// Database check helper
let isDbAvailable: boolean | null = null

async function checkDb(): Promise<boolean> {
  if (isDbAvailable !== null) return isDbAvailable

  const dbUrl = process.env.DATABASE_URL

  // 1. If no DATABASE_URL is set, or if explicitly configured to use mock data, or empty string
  if (!dbUrl || dbUrl.trim() === '' || process.env.USE_MOCK_DATA === 'true') {
    isDbAvailable = false
    return false
  }

  // 2. If running in production (e.g. Vercel) and DATABASE_URL points to localhost/dummy, do not connect
  if (
    process.env.NODE_ENV === 'production' &&
    (dbUrl.includes('localhost') ||
      dbUrl.includes('127.0.0.1') ||
      dbUrl.includes('crm_dummy') ||
      dbUrl.includes('freelancer_crm?schema=public'))
  ) {
    isDbAvailable = false
    return false
  }

  // 3. Must be a real remote postgres URL
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    isDbAvailable = false
    return false
  }

  try {
    const net = await import('net')
    const parsed = new URL(dbUrl.replace(/^postgresql:\/\//, 'http://'))
    const host = parsed.hostname || 'localhost'
    const port = parseInt(parsed.port) || 5432

    const isPortOpen = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket()
      socket.setTimeout(600)
      socket.on('connect', () => {
        socket.destroy()
        resolve(true)
      })
      socket.on('timeout', () => {
        socket.destroy()
        resolve(false)
      })
      socket.on('error', () => {
        socket.destroy()
        resolve(false)
      })
      socket.connect(port, host)
    })

    if (!isPortOpen) {
      isDbAvailable = false
      return false
    }

    await prisma.$queryRaw`SELECT 1`
    isDbAvailable = true
    return true
  } catch {
    isDbAvailable = false
    return false
  }
}

// Activity logger
export async function logActivity(action: string, entityType: string, entityId?: string, details?: string) {
  const newLog: ActivityLog = {
    id: `act-${Date.now()}`,
    action,
    entityType,
    entityId: entityId || null,
    details: details || null,
    createdAt: new Date().toISOString(),
  }
  memoryActivities.unshift(newLog)
  if (memoryActivities.length > 30) memoryActivities.pop()

  if (await checkDb()) {
    try {
      await prisma.activityLog.create({
        data: {
          action,
          entityType,
          entityId,
          details,
        },
      })
    } catch {
      // ignore
    }
  }
}

// ==================== CLIENTS ====================
export async function getClients(): Promise<Client[]> {
  if (await checkDb()) {
    try {
      const dbClients = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
        include: { projects: true, invoices: true, tasks: true },
      })
      return (dbClients as any[]).map((c: any) => ({
        ...c,
        status: c.status as Client['status'],
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        projects: (c.projects || []).map((p: any) => ({
          ...p,
          status: p.status as Project['status'],
          startDate: p.startDate?.toISOString() || null,
          endDate: p.endDate?.toISOString() || null,
          downpaymentPaidAt: p.downpaymentPaidAt?.toISOString() || null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
        invoices: (c.invoices || []).map((inv: any) => ({
          ...inv,
          status: inv.status as Invoice['status'],
          issueDate: inv.issueDate.toISOString(),
          dueDate: inv.dueDate.toISOString(),
          paidAt: inv.paidAt?.toISOString() || null,
          createdAt: inv.createdAt.toISOString(),
          updatedAt: inv.updatedAt.toISOString(),
          items: [],
        })),
        tasks: (c.tasks || []).map((t: any) => ({
          ...t,
          status: t.status as Task['status'],
          priority: t.priority as Task['priority'],
          dueDate: t.dueDate?.toISOString() || null,
          startedAt: t.startedAt?.toISOString() || null,
          completedAt: t.completedAt?.toISOString() || null,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
      }))
    } catch {
      // fallback
    }
  }
  return memoryClients
}

export async function getClient(id: string): Promise<Client | null> {
  if (await checkDb()) {
    try {
      const c = (await prisma.client.findUnique({
        where: { id },
        include: { projects: true, invoices: true, tasks: true, timeEntries: true },
      })) as any
      if (!c) return null
      return {
        ...c,
        status: c.status as Client['status'],
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        projects: (c.projects || []).map((p: any) => ({
          ...p,
          status: p.status as Project['status'],
          startDate: p.startDate?.toISOString() || null,
          endDate: p.endDate?.toISOString() || null,
          downpaymentPaidAt: p.downpaymentPaidAt?.toISOString() || null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
        invoices: (c.invoices || []).map((inv: any) => ({
          ...inv,
          status: inv.status as Invoice['status'],
          issueDate: inv.issueDate.toISOString(),
          dueDate: inv.dueDate.toISOString(),
          paidAt: inv.paidAt?.toISOString() || null,
          createdAt: inv.createdAt.toISOString(),
          updatedAt: inv.updatedAt.toISOString(),
          items: [],
        })),
        tasks: (c.tasks || []).map((t: any) => ({
          ...t,
          status: t.status as Task['status'],
          priority: t.priority as Task['priority'],
          dueDate: t.dueDate?.toISOString() || null,
          startedAt: t.startedAt?.toISOString() || null,
          completedAt: t.completedAt?.toISOString() || null,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
        timeEntries: (c.timeEntries || []).map((te: any) => ({
          ...te,
          date: te.date.toISOString(),
          createdAt: te.createdAt.toISOString(),
          updatedAt: te.updatedAt.toISOString(),
        })),
      }
    } catch {
      // fallback
    }
  }
  const client = memoryClients.find((c) => c.id === id)
  if (!client) return null
  return {
    ...client,
    projects: memoryProjects.filter((p) => p.clientId === id),
    invoices: memoryInvoices.filter((i) => i.clientId === id),
    tasks: memoryTasks.filter((t) => t.clientId === id),
    timeEntries: memoryTimeEntries.filter((te) => te.clientId === id),
  }
}

export async function createClient(data: Partial<Client>): Promise<Client> {
  const newClient: Client = {
    id: `cli-${Date.now()}`,
    name: data.name || 'New Client',
    companyName: data.companyName || null,
    email: data.email || '',
    phone: data.phone || null,
    website: data.website || null,
    status: data.status || 'ACTIVE',
    defaultRate: data.defaultRate || 120,
    budget: data.budget || 0,
    industry: data.industry || null,
    address: data.address || null,
    notes: data.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (await checkDb()) {
    try {
      const created = await prisma.client.create({
        data: {
          name: newClient.name,
          companyName: newClient.companyName,
          email: newClient.email,
          phone: newClient.phone,
          website: newClient.website,
          status: newClient.status,
          defaultRate: newClient.defaultRate,
          budget: newClient.budget,
          industry: newClient.industry,
          address: newClient.address,
          notes: newClient.notes,
        },
      })
      newClient.id = created.id
    } catch {
      // fallback
    }
  }

  memoryClients.unshift(newClient)
  await logActivity('Client Added', 'CLIENT', newClient.id, `Added client: ${newClient.name} (${newClient.companyName || 'Freelance'})`)
  return newClient
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client | null> {
  const index = memoryClients.findIndex((c) => c.id === id)
  if (index === -1) return null

  memoryClients[index] = {
    ...memoryClients[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  if (await checkDb()) {
    try {
      await prisma.client.update({
        where: { id },
        data: {
          name: data.name,
          companyName: data.companyName,
          email: data.email,
          phone: data.phone,
          website: data.website,
          status: data.status,
          defaultRate: data.defaultRate,
          budget: data.budget,
          industry: data.industry,
          address: data.address,
          notes: data.notes,
        },
      })
    } catch {
      // fallback
    }
  }

  await logActivity('Client Updated', 'CLIENT', id, `Updated client details for ${memoryClients[index].name}`)
  return memoryClients[index]
}

export async function deleteClient(id: string): Promise<boolean> {
  const index = memoryClients.findIndex((c) => c.id === id)
  if (index === -1) return false

  const name = memoryClients[index].name
  memoryClients.splice(index, 1)

  if (await checkDb()) {
    try {
      await prisma.client.delete({ where: { id } })
    } catch {
      // fallback
    }
  }

  await logActivity('Client Deleted', 'CLIENT', id, `Removed client ${name}`)
  return true
}

// ==================== LEADS ====================
export async function getLeads(): Promise<Lead[]> {
  if (await checkDb()) {
    try {
      const dbLeads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })
      return (dbLeads as any[]).map((l: any) => ({
        ...l,
        stage: l.stage as Lead['stage'],
        nextFollowUp: l.nextFollowUp?.toISOString() || null,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      }))
    } catch {
      // fallback
    }
  }
  return memoryLeads
}

export async function getLead(id: string): Promise<Lead | null> {
  return memoryLeads.find((l) => l.id === id) || null
}

export async function createLead(data: Partial<Lead>): Promise<Lead> {
  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    name: data.name || 'New Lead',
    company: data.company || null,
    email: data.email || '',
    phone: data.phone || null,
    dealValue: data.dealValue || 0,
    stage: data.stage || 'NEW',
    source: data.source || 'Inbound',
    notes: data.notes || null,
    nextFollowUp: data.nextFollowUp || null,
    convertedClientId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (await checkDb()) {
    try {
      const created = await prisma.lead.create({
        data: {
          name: newLead.name,
          company: newLead.company,
          email: newLead.email,
          phone: newLead.phone,
          dealValue: newLead.dealValue,
          stage: newLead.stage,
          source: newLead.source,
          notes: newLead.notes,
          nextFollowUp: newLead.nextFollowUp ? new Date(newLead.nextFollowUp) : null,
        },
      })
      newLead.id = created.id
    } catch {
      // fallback
    }
  }

  memoryLeads.unshift(newLead)
  await logActivity('Lead Created', 'LEAD', newLead.id, `New lead: ${newLead.name} ($${newLead.dealValue})`)
  return newLead
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead | null> {
  const index = memoryLeads.findIndex((l) => l.id === id)
  if (index === -1) return null

  memoryLeads[index] = {
    ...memoryLeads[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  if (await checkDb()) {
    try {
      await prisma.lead.update({
        where: { id },
        data: {
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          dealValue: data.dealValue,
          stage: data.stage,
          source: data.source,
          notes: data.notes,
          nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
        },
      })
    } catch {
      // fallback
    }
  }

  await logActivity('Lead Updated', 'LEAD', id, `Updated lead stage to ${memoryLeads[index].stage}`)
  return memoryLeads[index]
}

export async function deleteLead(id: string): Promise<boolean> {
  const index = memoryLeads.findIndex((l) => l.id === id)
  if (index === -1) return false
  memoryLeads.splice(index, 1)
  return true
}

export async function convertLeadToClient(leadId: string): Promise<{ client: Client; lead: Lead }> {
  const lead = memoryLeads.find((l) => l.id === leadId)
  if (!lead) throw new Error('Lead not found')

  const client = await createClient({
    name: lead.name,
    companyName: lead.company,
    email: lead.email,
    phone: lead.phone,
    budget: lead.dealValue,
    status: 'ACTIVE',
    notes: `Converted from lead (${lead.source || 'Pipeline'}). Original notes: ${lead.notes || 'None'}`,
  })

  // Update lead stage
  await updateLead(leadId, {
    stage: 'WON',
    convertedClientId: client.id,
  })

  // Also create a starter project for this won client
  await createProject({
    title: `${lead.company || lead.name} - Kickoff Project`,
    description: `Initial project converted from closed deal ($${lead.dealValue})`,
    clientId: client.id,
    budget: lead.dealValue,
    status: 'PLANNING',
    progress: 0,
  })

  await logActivity('Lead Converted to Client', 'CLIENT', client.id, `Converted lead ${lead.name} into active client & started project`)
  return { client, lead }
}

// ==================== PROJECTS ====================
export async function getProjects(userId?: string, role?: string): Promise<Project[]> {
  if (await checkDb()) {
    try {
      const dbProjects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: { client: true, tasks: true, timeEntries: true },
      })
      const mapped = (dbProjects as any[]).map((p: any) => ({
        ...p,
        status: p.status as Project['status'],
        clientName: p.client?.name || 'Client',
        startDate: p.startDate?.toISOString() || null,
        endDate: p.endDate?.toISOString() || null,
        downpaymentPaidAt: p.downpaymentPaidAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        tasks: (p.tasks || []).map((t: any) => ({
          ...t,
          status: t.status as Task['status'],
          priority: t.priority as Task['priority'],
          dueDate: t.dueDate?.toISOString() || null,
          startedAt: t.startedAt?.toISOString() || null,
          completedAt: t.completedAt?.toISOString() || null,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
        timeEntries: (p.timeEntries || []).map((te: any) => ({
          ...te,
          date: te.date.toISOString(),
          createdAt: te.createdAt.toISOString(),
          updatedAt: te.updatedAt.toISOString(),
        })),
      }))
      return mapped
    } catch {
      // fallback
    }
  }
  let list = memoryProjects.map((p) => ({
    ...p,
    milestones: memoryMilestones.filter((m) => m.projectId === p.id),
    tasks: memoryTasks.filter((t) => t.projectId === p.id),
  }))
  if (role === 'DEVELOPER' && userId) {
    list = list.filter((p) => p.assignedUserIds?.includes(userId))
  }
  return list
}

export async function getProject(id: string): Promise<Project | null> {
  const prj = memoryProjects.find((p) => p.id === id)
  if (!prj) return null
  return {
    ...prj,
    milestones: memoryMilestones.filter((m) => m.projectId === id),
    tasks: memoryTasks.filter((t) => t.projectId === id),
    timeEntries: memoryTimeEntries.filter((te) => te.projectId === id),
  }
}

export async function createProject(data: Partial<Project> & { initialMilestones?: Partial<ProjectMilestone>[] }): Promise<Project> {
  const client = memoryClients.find((c) => c.id === data.clientId)
  const assignedIds = data.assignedUserIds || []
  const assignedNames = assignedIds.map((uid) => memoryUsers.find((u) => u.id === uid)?.name || 'Developer')

  const budget = data.budget || 0
  const downpaymentPercent = data.downpaymentPercent !== undefined ? data.downpaymentPercent : (data.billingType === 'FIXED' ? 15 : 0)
  const downpaymentAmount = data.downpaymentAmount !== undefined ? data.downpaymentAmount : (budget * (downpaymentPercent || 0)) / 100

  const newProject: Project = {
    id: `prj-${Date.now()}`,
    title: data.title || 'New Project',
    description: data.description || null,
    status: data.status || 'PLANNING',
    billingType: data.billingType || 'FIXED',
    hourlyRate: data.hourlyRate || null,
    budget,
    spent: data.downpaymentPaid ? (downpaymentAmount || 0) : (data.spent || 0),
    progress: data.progress || 0,
    downpaymentPercent,
    downpaymentAmount,
    downpaymentPaid: !!data.downpaymentPaid,
    downpaymentPaidAt: data.downpaymentPaid ? new Date().toISOString() : null,
    downpaymentMethod: data.downpaymentMethod || null,
    downpaymentNote: data.downpaymentNote || null,
    startDate: data.startDate || new Date().toISOString(),
    endDate: data.endDate || null,
    clientId: data.clientId || (memoryClients[0]?.id ?? 'cli-1'),
    clientName: client?.companyName || client?.name || 'Client',
    assignedUserIds: assignedIds,
    assignedUserNames: assignedNames,
    teamMembers: assignedIds.map((uid) => {
      const u = memoryUsers.find((usr) => usr.id === uid)
      return {
        userId: uid,
        userName: u?.name || 'Developer',
        userRole: u?.role || 'DEVELOPER',
        roleOnProject: u?.title || 'Engineer',
        hourlyRate: u?.hourlyRate || 85,
      }
    }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  memoryProjects.unshift(newProject)

  // If initial milestones provided or fixed price, create them
  if (data.initialMilestones && data.initialMilestones.length > 0) {
    data.initialMilestones.forEach((m, idx) => {
      memoryMilestones.push({
        id: `mls-${Date.now()}-${idx}`,
        projectId: newProject.id,
        title: m.title || `Milestone ${idx + 1}`,
        description: m.description || null,
        amount: m.amount || 0,
        percentage: m.percentage || null,
        dueDate: m.dueDate || null,
        status: m.status || 'UPCOMING',
        paymentStatus: m.paymentStatus || 'UNPAID',
        paidAt: m.paidAt || null,
        paidAmount: m.paidAmount || 0,
        paymentMethod: m.paymentMethod || null,
        paymentNote: m.paymentNote || null,
        order: idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    })
  }

  await logActivity('Project Created', 'PROJECT', newProject.id, `Started project: ${newProject.title} (${newProject.billingType})`)
  return newProject
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  const index = memoryProjects.findIndex((p) => p.id === id)
  if (index === -1) return null

  const assignedIds = data.assignedUserIds !== undefined ? data.assignedUserIds : memoryProjects[index].assignedUserIds
  const assignedNames = assignedIds ? assignedIds.map((uid) => memoryUsers.find((u) => u.id === uid)?.name || 'Developer') : []

  memoryProjects[index] = {
    ...memoryProjects[index],
    ...data,
    assignedUserIds: assignedIds,
    assignedUserNames: assignedNames,
    updatedAt: new Date().toISOString(),
  }

  await logActivity('Project Updated', 'PROJECT', id, `Updated project: ${memoryProjects[index].title}`)
  return memoryProjects[index]
}

export async function deleteProject(id: string): Promise<boolean> {
  const index = memoryProjects.findIndex((p) => p.id === id)
  if (index === -1) return false
  memoryProjects.splice(index, 1)
  // delete associated milestones
  memoryMilestones = memoryMilestones.filter((m) => m.projectId !== id)
  return true
}

// ==================== MILESTONES & PAYMENTS ====================
export async function getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
  return memoryMilestones
    .filter((m) => m.projectId === projectId)
    .sort((a, b) => a.order - b.order)
}

export async function createProjectMilestone(projectId: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
  const count = memoryMilestones.filter((m) => m.projectId === projectId).length
  const newMilestone: ProjectMilestone = {
    id: `mls-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    projectId,
    title: data.title || 'New Milestone',
    description: data.description || null,
    amount: data.amount || 0,
    percentage: data.percentage || null,
    dueDate: data.dueDate || null,
    status: data.status || 'UPCOMING',
    paymentStatus: data.paymentStatus || 'UNPAID',
    paidAt: data.paidAt || null,
    paidAmount: data.paidAmount || (data.paymentStatus === 'PAID' ? data.amount || 0 : 0),
    paymentMethod: data.paymentMethod || null,
    paymentNote: data.paymentNote || null,
    order: data.order !== undefined ? data.order : count + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  memoryMilestones.push(newMilestone)
  await logActivity('Milestone Added', 'PROJECT', projectId, `Added milestone: ${newMilestone.title} ($${newMilestone.amount})`)
  return newMilestone
}

export async function updateProjectMilestone(milestoneId: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone | null> {
  const index = memoryMilestones.findIndex((m) => m.id === milestoneId)
  if (index === -1) return null

  memoryMilestones[index] = {
    ...memoryMilestones[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  await logActivity('Milestone Updated', 'PROJECT', memoryMilestones[index].projectId, `Updated milestone: ${memoryMilestones[index].title}`)
  return memoryMilestones[index]
}

export async function deleteProjectMilestone(milestoneId: string): Promise<boolean> {
  const index = memoryMilestones.findIndex((m) => m.id === milestoneId)
  if (index === -1) return false
  const mls = memoryMilestones[index]
  memoryMilestones.splice(index, 1)
  await logActivity('Milestone Deleted', 'PROJECT', mls.projectId, `Removed milestone: ${mls.title}`)
  return true
}

export async function recordMilestonePayment(
  milestoneId: string,
  paymentData: { paidAmount?: number; paymentMethod?: string; paymentNote?: string; paidAt?: string }
): Promise<ProjectMilestone | null> {
  const index = memoryMilestones.findIndex((m) => m.id === milestoneId)
  if (index === -1) return null

  const mls = memoryMilestones[index]
  const paidAmount = paymentData.paidAmount !== undefined ? paymentData.paidAmount : mls.amount
  const paidAt = paymentData.paidAt || new Date().toISOString()
  const paymentMethod = paymentData.paymentMethod || 'Stripe'

  memoryMilestones[index] = {
    ...mls,
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    paidAmount,
    paidAt,
    paymentMethod,
    paymentNote: paymentData.paymentNote || mls.paymentNote,
    updatedAt: new Date().toISOString(),
  }

  // Update project collected spent amount
  const prjIndex = memoryProjects.findIndex((p) => p.id === mls.projectId)
  if (prjIndex !== -1) {
    const totalPaidOnMilestones = memoryMilestones
      .filter((m) => m.projectId === mls.projectId && m.paymentStatus === 'PAID')
      .reduce((sum, m) => sum + m.paidAmount, 0)
    const downpayment = memoryProjects[prjIndex].downpaymentPaid ? (memoryProjects[prjIndex].downpaymentAmount || 0) : 0
    memoryProjects[prjIndex].spent = totalPaidOnMilestones + downpayment
  }

  await logActivity(
    'Milestone Payment Recorded',
    'PROJECT',
    mls.projectId,
    `Collected $${paidAmount.toLocaleString()} for milestone: ${mls.title} via ${paymentMethod}`
  )

  return memoryMilestones[index]
}

export async function recordProjectDownpayment(
  projectId: string,
  data: { amount?: number; paymentMethod?: string; paymentNote?: string; paidAt?: string }
): Promise<Project | null> {
  const index = memoryProjects.findIndex((p) => p.id === projectId)
  if (index === -1) return null

  const prj = memoryProjects[index]
  const amount = data.amount !== undefined ? data.amount : (prj.downpaymentAmount || 0)
  const paidAt = data.paidAt || new Date().toISOString()
  const method = data.paymentMethod || 'Stripe'

  memoryProjects[index] = {
    ...prj,
    downpaymentPaid: true,
    downpaymentPaidAt: paidAt,
    downpaymentAmount: amount,
    downpaymentMethod: method,
    downpaymentNote: data.paymentNote || prj.downpaymentNote,
    spent: (prj.spent || 0) + amount,
    updatedAt: new Date().toISOString(),
  }

  await logActivity(
    'Downpayment Recorded',
    'PROJECT',
    projectId,
    `Received initial upfront downpayment of $${amount.toLocaleString()} for ${prj.title} via ${method}`
  )

  return memoryProjects[index]
}

// ==================== TASKS ====================
export async function getTasks(userId?: string, role?: string): Promise<Task[]> {
  let list = memoryTasks
  if (role === 'DEVELOPER' && userId) {
    list = memoryTasks.filter((t) => t.assignedToId === userId)
  }
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  const prj = memoryProjects.find((p) => p.id === data.projectId)
  const cli = memoryClients.find((c) => c.id === data.clientId)
  const assignee = data.assignedToId ? memoryUsers.find((u) => u.id === data.assignedToId) : null
  const targetStatus = data.status || 'TODO'

  // Push existing tasks in this column down by 1 so new task is at top
  memoryTasks
    .filter((t) => t.status === targetStatus)
    .forEach((t) => {
      t.order = (t.order ?? 0) + 1
    })

  const newTask: Task = {
    id: `tsk-${Date.now()}`,
    title: data.title || 'New Task',
    description: data.description || null,
    status: targetStatus,
    priority: data.priority || 'MEDIUM',
    dueDate: data.dueDate || null,
    startedAt: data.startedAt || (data.status === 'IN_PROGRESS' ? new Date().toISOString() : null),
    completedAt: data.completedAt || (data.status === 'DONE' ? new Date().toISOString() : null),
    estimatedHours: data.estimatedHours || 0,
    actualHours: data.actualHours || 0,
    projectId: data.projectId || null,
    projectTitle: prj?.title,
    clientId: data.clientId || prj?.clientId || null,
    clientName: cli?.name || prj?.clientName,
    assignedToId: data.assignedToId || null,
    assignedToName: assignee?.name || data.assignedToName || null,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  memoryTasks.unshift(newTask)
  await logActivity('Task Created', 'TASK', newTask.id, `Created task: ${newTask.title}${newTask.assignedToName ? ` (Assigned to ${newTask.assignedToName})` : ''}`)
  return newTask
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
  const index = memoryTasks.findIndex((t) => t.id === id)
  if (index === -1) return null

  const task = memoryTasks[index]
  const wasDone = task.status === 'DONE'
  const now = new Date().toISOString()

  let startedAt = data.startedAt !== undefined ? data.startedAt : task.startedAt
  if (data.status === 'IN_PROGRESS' && !startedAt) {
    startedAt = now
  }

  let completedAt = data.completedAt !== undefined ? data.completedAt : task.completedAt
  if (data.status === 'DONE' && !completedAt) {
    completedAt = now
  }

  let actualHours = data.actualHours !== undefined ? data.actualHours : task.actualHours
  if (data.status === 'DONE' && startedAt && actualHours === 0) {
    const diffMs = new Date(completedAt || now).getTime() - new Date(startedAt).getTime()
    const computed = Math.max(0.2, Math.round((diffMs / 3600000) * 10) / 10)
    actualHours = computed
  }

  const assignee = data.assignedToId ? memoryUsers.find((u) => u.id === data.assignedToId) : null

  memoryTasks[index] = {
    ...task,
    ...data,
    startedAt,
    completedAt,
    actualHours,
    order: data.order !== undefined ? data.order : task.order,
    assignedToId: data.assignedToId !== undefined ? data.assignedToId : task.assignedToId,
    assignedToName: assignee ? assignee.name : (data.assignedToName !== undefined ? data.assignedToName : task.assignedToName),
    updatedAt: now,
  }

  if (!wasDone && data.status === 'DONE') {
    await logActivity('Task Completed', 'TASK', id, `Completed: ${memoryTasks[index].title}${memoryTasks[index].assignedToName ? ` by ${memoryTasks[index].assignedToName}` : ''}`)
  } else if (data.status === 'IN_PROGRESS' && task.status !== 'IN_PROGRESS') {
    await logActivity('Task Started', 'TASK', id, `Started work on: ${memoryTasks[index].title}`)
  }

  return memoryTasks[index]
}

export async function reorderTask(
  taskId: string,
  targetStatus: TaskStatus,
  targetIndex: number
): Promise<Task[]> {
  const index = memoryTasks.findIndex((t) => t.id === taskId)
  if (index === -1) return memoryTasks

  const task = memoryTasks[index]
  const oldStatus = task.status
  const wasDone = task.status === 'DONE'
  const now = new Date().toISOString()

  let startedAt = task.startedAt
  if (targetStatus === 'IN_PROGRESS' && !startedAt) {
    startedAt = now
  }
  let completedAt = task.completedAt
  if (targetStatus === 'DONE' && !completedAt) {
    completedAt = now
  }

  task.status = targetStatus
  task.startedAt = startedAt
  task.completedAt = completedAt
  task.updatedAt = now

  // Remove task from memoryTasks
  memoryTasks.splice(index, 1)

  // Get tasks currently in the target column
  const targetColTasks = memoryTasks
    .filter((t) => t.status === targetStatus)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const boundedIndex = Math.max(0, Math.min(targetIndex, targetColTasks.length))

  if (boundedIndex >= targetColTasks.length) {
    if (targetColTasks.length > 0) {
      const lastTarget = targetColTasks[targetColTasks.length - 1]
      const insertPos = memoryTasks.indexOf(lastTarget) + 1
      memoryTasks.splice(insertPos, 0, task)
    } else {
      memoryTasks.push(task)
    }
  } else {
    const nextTarget = targetColTasks[boundedIndex]
    const insertPos = memoryTasks.indexOf(nextTarget)
    memoryTasks.splice(insertPos, 0, task)
  }

  // Renumber serial orders for target column
  const updatedTargetTasks = memoryTasks
    .filter((t) => t.status === targetStatus)
  updatedTargetTasks.forEach((t, i) => {
    t.order = i
  })

  // Renumber serial orders for old column if status changed
  if (oldStatus !== targetStatus) {
    const updatedOldTasks = memoryTasks.filter((t) => t.status === oldStatus)
    updatedOldTasks.forEach((t, i) => {
      t.order = i
    })
  }

  if (!wasDone && targetStatus === 'DONE') {
    await logActivity('Task Completed', 'TASK', taskId, `Completed: ${task.title}`)
  } else if (targetStatus === 'IN_PROGRESS' && oldStatus !== 'IN_PROGRESS') {
    await logActivity('Task Started', 'TASK', taskId, `Started work on: ${task.title}`)
  }

  return memoryTasks
}

export async function startTask(id: string): Promise<Task | null> {
  return updateTask(id, {
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
  })
}

export async function completeTask(id: string): Promise<Task | null> {
  return updateTask(id, {
    status: 'DONE',
    completedAt: new Date().toISOString(),
  })
}

export async function deleteTask(id: string): Promise<boolean> {
  const index = memoryTasks.findIndex((t) => t.id === id)
  if (index === -1) return false
  memoryTasks.splice(index, 1)
  return true
}

// ==================== TIME ENTRIES ====================
export async function getTimeEntries(): Promise<TimeEntry[]> {
  return memoryTimeEntries
}

export async function createTimeEntry(data: Partial<TimeEntry>): Promise<TimeEntry> {
  const prj = memoryProjects.find((p) => p.id === data.projectId)
  const cli = memoryClients.find((c) => c.id === data.clientId)

  const newEntry: TimeEntry = {
    id: `tim-${Date.now()}`,
    description: data.description || 'General freelance work',
    durationMinutes: data.durationMinutes || 60,
    hourlyRate: data.hourlyRate || 120,
    billable: data.billable !== false,
    date: data.date || new Date().toISOString(),
    projectId: data.projectId || null,
    projectTitle: prj?.title,
    clientId: data.clientId || prj?.clientId || null,
    clientName: cli?.name || prj?.clientName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  memoryTimeEntries.unshift(newEntry)

  // Also update project spent cost if linked
  if (prj && newEntry.billable) {
    const billAmount = (newEntry.durationMinutes / 60) * newEntry.hourlyRate
    prj.spent = Math.round((prj.spent + billAmount) * 100) / 100
  }

  await logActivity(
    'Time Logged',
    'TIME_ENTRY',
    newEntry.id,
    `${(newEntry.durationMinutes / 60).toFixed(1)}h logged on ${newEntry.projectTitle || 'freelance tasks'}`
  )
  return newEntry
}

export async function deleteTimeEntry(id: string): Promise<boolean> {
  const index = memoryTimeEntries.findIndex((te) => te.id === id)
  if (index === -1) return false
  memoryTimeEntries.splice(index, 1)
  return true
}

// ==================== INVOICES ====================
export async function getInvoices(): Promise<Invoice[]> {
  return memoryInvoices
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  return memoryInvoices.find((i) => i.id === id) || null
}

export async function createInvoice(data: Partial<Invoice>): Promise<Invoice> {
  const client = memoryClients.find((c) => c.id === data.clientId)
  const project = memoryProjects.find((p) => p.id === data.projectId)

  const items = data.items || [
    {
      id: `item-${Date.now()}-1`,
      description: 'Freelance development services',
      quantity: 1,
      unitPrice: 1500,
      amount: 1500,
    },
  ]

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
  const taxRate = data.taxRate || 0
  const taxAmount = (subtotal * taxRate) / 100
  const discount = data.discount || 0
  const total = Math.max(0, subtotal + taxAmount - discount)

  const nextNumber = `INV-2026-00${memoryInvoices.length + 1}`

  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber: data.invoiceNumber || nextNumber,
    issueDate: data.issueDate || new Date().toISOString(),
    dueDate: data.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
    status: data.status || 'DRAFT',
    notes: data.notes || 'Payment due within 14 days of invoice date.',
    subtotal,
    taxRate,
    taxAmount,
    discount,
    total,
    paidAt: data.status === 'PAID' ? new Date().toISOString() : null,
    clientId: data.clientId || memoryClients[0]?.id || 'cli-1',
    clientName: client?.companyName || client?.name || 'Client',
    projectId: data.projectId || null,
    projectTitle: project?.title,
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  memoryInvoices.unshift(newInvoice)
  await logActivity('Invoice Created', 'INVOICE', newInvoice.id, `Created ${newInvoice.invoiceNumber} for $${newInvoice.total}`)
  return newInvoice
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
  const index = memoryInvoices.findIndex((i) => i.id === id)
  if (index === -1) return null

  const wasPaid = memoryInvoices[index].status === 'PAID'
  memoryInvoices[index] = {
    ...memoryInvoices[index],
    ...data,
    paidAt: data.status === 'PAID' ? (memoryInvoices[index].paidAt || new Date().toISOString()) : null,
    updatedAt: new Date().toISOString(),
  }

  if (!wasPaid && data.status === 'PAID') {
    await logActivity('Invoice Paid', 'INVOICE', id, `Payment received for ${memoryInvoices[index].invoiceNumber}`)
  }
  return memoryInvoices[index]
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const index = memoryInvoices.findIndex((i) => i.id === id)
  if (index === -1) return false
  memoryInvoices.splice(index, 1)
  return true
}

// ==================== ISSUES / QA ====================
export async function getIssues(): Promise<Issue[]> {
  return memoryIssues
}

export async function createIssue(data: Partial<Issue>): Promise<Issue> {
  const prj = memoryProjects.find((p) => p.id === data.projectId)
  const cli = memoryClients.find((c) => c.id === data.clientId)

  const newIssue: Issue = {
    id: `iss-${Date.now()}`,
    title: data.title || 'New Deliverable Issue',
    description: data.description || '',
    type: data.type || 'BUG',
    severity: data.severity || 'MEDIUM',
    status: data.status || 'OPEN',
    clientId: data.clientId || prj?.clientId || null,
    clientName: cli?.name || prj?.clientName,
    projectId: data.projectId || null,
    projectTitle: prj?.title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  memoryIssues.unshift(newIssue)
  await logActivity('QA Issue Logged', 'ISSUE', newIssue.id, `Logged ${newIssue.type}: ${newIssue.title}`)
  return newIssue
}

export async function updateIssue(id: string, data: Partial<Issue>): Promise<Issue | null> {
  const index = memoryIssues.findIndex((i) => i.id === id)
  if (index === -1) return null

  memoryIssues[index] = {
    ...memoryIssues[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  return memoryIssues[index]
}

export async function deleteIssue(id: string): Promise<boolean> {
  const index = memoryIssues.findIndex((i) => i.id === id)
  if (index === -1) return false
  memoryIssues.splice(index, 1)
  return true
}

// ==================== USERS & TEAM (RBAC) ====================
export async function getUsers(): Promise<User[]> {
  if (await checkDb()) {
    try {
      const dbUsers = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
      return (dbUsers as any[]).map((u: any) => ({
        ...u,
        role: u.role as UserRole,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      }))
    } catch {
      // fallback
    }
  }
  return memoryUsers
}

export async function getUser(id: string): Promise<User | null> {
  if (await checkDb()) {
    try {
      const u = await prisma.user.findUnique({ where: { id } })
      if (u) {
        return {
          ...u,
          role: u.role as UserRole,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        }
      }
    } catch {
      // fallback
    }
  }
  return memoryUsers.find((u) => u.id === id) || null
}

export async function createUser(data: Partial<User>): Promise<User> {
  const newUser: User = {
    id: `usr-${Date.now()}`,
    name: data.name || 'New Team Member',
    email: data.email || `user-${Date.now()}@agency.dev`,
    role: data.role || 'DEVELOPER',
    avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name || 'member')}`,
    title: data.title || (data.role === 'LEAD_GEN' ? 'Lead Generation Specialist' : data.role === 'DEVELOPER' ? 'Software Developer' : 'Team Member'),
    hourlyRate: data.hourlyRate || 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (await checkDb()) {
    try {
      const created = await prisma.user.create({
        data: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          title: newUser.title,
          hourlyRate: newUser.hourlyRate || 0,
        },
      })
      newUser.id = created.id
    } catch {
      // fallback
    }
  }

  memoryUsers.push(newUser)
  await logActivity('Team Member Added', 'USER', newUser.id, `Added ${newUser.name} as ${newUser.role}`)
  return newUser
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const index = memoryUsers.findIndex((u) => u.id === id)
  if (index === -1) return null

  memoryUsers[index] = {
    ...memoryUsers[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  if (await checkDb()) {
    try {
      await prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          role: data.role,
          title: data.title,
          avatar: data.avatar,
          hourlyRate: data.hourlyRate,
        },
      })
    } catch {
      // fallback
    }
  }

  return memoryUsers[index]
}

// ==================== LEAD ACTIVITIES (Progress & Screenshots) ====================
export async function getLeadActivities(leadId: string): Promise<LeadActivity[]> {
  if (await checkDb()) {
    try {
      const dbActs = await prisma.leadActivity.findMany({
        where: { leadId },
        orderBy: { createdAt: 'desc' },
      })
      return (dbActs as any[]).map((a: any) => ({
        ...a,
        type: a.type as LeadActivity['type'],
        createdAt: a.createdAt.toISOString(),
      }))
    } catch {
      // fallback
    }
  }
  return memoryLeadActivities.filter((a) => a.leadId === leadId)
}

export async function createLeadActivity(leadId: string, data: Partial<LeadActivity>): Promise<LeadActivity> {
  const author = data.authorId ? memoryUsers.find((u) => u.id === data.authorId) : null
  const newActivity: LeadActivity = {
    id: `act-lead-${Date.now()}`,
    leadId,
    type: data.type || 'NOTE',
    channel: data.channel || null,
    title: data.title || 'Lead Update Logged',
    content: data.content || '',
    imageUrl: data.imageUrl || null,
    authorName: author?.name || data.authorName || 'Lead Gen Specialist',
    authorId: data.authorId || author?.id || null,
    createdAt: new Date().toISOString(),
  }

  if (await checkDb()) {
    try {
      const created = await prisma.leadActivity.create({
        data: {
          leadId: newActivity.leadId,
          type: newActivity.type,
          channel: newActivity.channel,
          title: newActivity.title,
          content: newActivity.content,
          imageUrl: newActivity.imageUrl,
          authorName: newActivity.authorName,
          authorId: newActivity.authorId,
        },
      })
      newActivity.id = created.id
    } catch {
      // fallback
    }
  }

  memoryLeadActivities.unshift(newActivity)

  // Update lead's updatedAt and notes if appropriate
  const leadIndex = memoryLeads.findIndex((l) => l.id === leadId)
  if (leadIndex !== -1) {
    memoryLeads[leadIndex].updatedAt = new Date().toISOString()
  }

  await logActivity('Lead Activity Added', 'LEAD', leadId, `Logged ${newActivity.type} for lead: ${newActivity.title}`)
  return newActivity
}

// ==================== DASHBOARD METRICS ====================
export async function getDashboardMetrics(userId?: string, role?: string): Promise<DashboardMetrics> {
  const totalRevenue = memoryInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, i) => acc + i.total, 0)

  const revenueThisMonth = 3500

  const activeClientsCount = memoryClients.filter((c) => c.status === 'ACTIVE').length
  const activeProjectsCount = memoryProjects.filter((p) => p.status === 'ACTIVE').length
  const openTasksCount = memoryTasks.filter((t) => t.status !== 'DONE').length

  const billableEntries = memoryTimeEntries.filter((te) => te.billable)
  const unbilledHours = Math.round((billableEntries.reduce((acc, te) => acc + te.durationMinutes, 0) / 60) * 10) / 10
  const unbilledAmount = billableEntries.reduce((acc, te) => acc + (te.durationMinutes / 60) * te.hourlyRate, 0)

  const pipelineValue = memoryLeads
    .filter((l) => l.stage !== 'LOST' && l.stage !== 'WON')
    .reduce((acc, l) => acc + l.dealValue, 0)

  const monthlyRevenueData = [
    { month: 'Apr', revenue: 4200, billed: 3800 },
    { month: 'May', revenue: 6100, billed: 5400 },
    { month: 'Jun', revenue: 8400, billed: 7900 },
    { month: 'Jul', revenue: 7200, billed: 6800 },
    { month: 'Aug', revenue: 9500, billed: 9100 },
    { month: 'Sep', revenue: 11200, billed: 10400 },
  ]

  let urgentTasks = memoryTasks.filter((t) => t.status !== 'DONE' && (t.priority === 'URGENT' || t.priority === 'HIGH'))
  let ongoingProjects = memoryProjects.filter((p) => p.status === 'ACTIVE' || p.status === 'REVIEW')

  let myAssignedTasksCount = 0
  let myAssignedProjectsCount = 0
  const totalLeadsCount = memoryLeads.length

  if (role === 'DEVELOPER' && userId) {
    urgentTasks = memoryTasks.filter((t) => t.assignedToId === userId && t.status !== 'DONE')
    ongoingProjects = memoryProjects.filter((p) => p.assignedUserIds?.includes(userId))
    myAssignedTasksCount = memoryTasks.filter((t) => t.assignedToId === userId && t.status !== 'DONE').length
    myAssignedProjectsCount = ongoingProjects.length
  } else if (role === 'LEAD_GEN' && userId) {
    urgentTasks = memoryTasks.filter((t) => t.assignedToId === userId && t.status !== 'DONE')
    myAssignedTasksCount = urgentTasks.length
  }

  return {
    totalRevenue,
    revenueThisMonth,
    activeClientsCount,
    activeProjectsCount,
    openTasksCount,
    unbilledHours,
    unbilledAmount,
    pipelineValue,
    monthlyRevenueData,
    recentActivities: memoryActivities.slice(0, 8),
    urgentTasks: urgentTasks.slice(0, 5),
    ongoingProjects,
    role: (role as UserRole) || 'ADMIN',
    myAssignedTasksCount,
    myAssignedProjectsCount,
    totalLeadsCount,
  }
}
