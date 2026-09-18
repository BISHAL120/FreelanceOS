<div align="center">

# ⚡ FreelanceOS

**The modern, full-stack operating system for freelancers, indie hackers, and boutique digital agencies.**

Manage clients, track leads, invoice milestones, plan projects, organize tasks with Kanban, track billable hours, and store startup ideas — all in one unified, role-based workspace.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

[Live Demo](#quick-start) • [Key Features](#-key-features) • [Architecture](#-architecture--backend-overview) • [Getting Started](#-getting-started) • [Database Setup](#-database-setup-optional) • [Roadmap](#-roadmap)

</div>

---

## 📖 Overview

**FreelanceOS** is a developer-crafted freelance management suite designed to replace messy spreadsheets, disconnected Notion docs, and clunky CRMs. Built on **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Prisma ORM**, FreelanceOS offers an end-to-end workflow from lead outreach to milestone invoice delivery.

### 🌟 Why FreelanceOS?

- **Hybrid Dual-Engine**: Run completely standalone with rich in-memory mock data for zero-config testing and previews, or plug in PostgreSQL with Prisma ORM for full persistence.
- **Built for Agency Workflows**: Native support for upfront downpayments, milestone approvals, billable timer calculations, multi-member team assignments, and client lead conversion.
- **Role-Based Workspaces**: Tailored interfaces and navigation for **Agency Owners (Admin)**, **Lead Gen Specialists**, and **Developers**.
- **Mobile-First Responsive**: Designed with a bespoke mobile bottom navigation bar, slide-out drawer sheets, and touch-optimized controls.

---

## ✨ Key Features

### 1. 📊 Executive Dashboard
- **Financial KPIs**: Track total lifetime revenue, monthly cash collected, active projects, open tasks, unbilled hours, and sales pipeline value.
- **Interactive Revenue Charts**: Visual monthly revenue breakdown with billed vs. collected earnings powered by Recharts.
- **Persistent Live Timer**: Real-time stop-clock in the navigation header with single-click project billable log submission.
- **Quick Action Hub**: Universal shortcut modal to quickly create clients, projects, tasks, leads, or invoices anywhere in the app.

### 2. 👥 Client Relationship Management (CRM)
- Centralized client directory with company metadata, hourly rates, project budgets, and contact links.
- Client detailed dossier showing linked projects, invoice payment history, active tasks, and historical time logs.
- Search, filter, and archive capabilities.

### 3. 🎯 Leads & Deals Pipeline
- **Kanban & Table Views**: Multi-stage deal pipeline (`New Inbound` ➔ `Contacted` ➔ `Qualified` ➔ `Proposal Sent` ➔ `Negotiating` ➔ `Won` ➔ `Lost`).
- **Omni-Channel Conversation Feed**: Log communications across WhatsApp, Telegram, LinkedIn, Messenger, Email, and Phone with screenshot attachment support.
- **1-Click Conversion**: Instantly transform qualified deals into active Clients and Projects with budget pre-fills.

### 4. 🚀 Projects & Milestone Billing Engine
- **Billing Types**: Flexible project pricing models supporting **Fixed Price** or **Hourly Rate**.
- **Milestone Management**: Deliverables broken down into phased milestones with individual budgets, due dates, statuses, and payment states (`UNPAID`, `INVOICED`, `PAID`).
- **Downpayment Tracker**: Built-in upfront retainer/deposit management with payment timestamp and method verification.
- **Team Assignment**: Allocate developers and specialists to projects with individual hourly rates and roles.

### 5. 📋 Sprint Tasks & Kanban Board
- Interactive 4-column Kanban board (`To Do`, `In Progress`, `In Review`, `Done`) and dense table view.
- Priority indicators (`Urgent`, `High`, `Medium`, `Low`), due dates, estimated vs. actual hours, and milestone linkages.
- Instant drag-and-drop status transitions and column reordering.

### 6. ⏱️ Time Tracker & Timesheets
- Interactive active timer with auto-ticking duration and billable dollar value calculation.
- Manual time entry dialog for offline or retrospective logging.
- Filterable time history grouped by client, project, and team member.

### 7. 📄 Invoicing & Printable Invoices
- Multi-line item invoice generator with automatic subtotal, tax rate, and discount computations.
- Invoice status tracking (`Draft`, `Sent`, `Paid`, `Overdue`, `Cancelled`).
- Built-in printable invoice layout ready for browser printing or PDF generation (`window.print()`).

### 8. 🛡️ QA & Defect Tracking
- Dedicated bug and issue triage board for client deliverables.
- Categorized by type (`Bug`, `Feature Request`, `Feedback`, `Question`) and severity (`Low`, `Medium`, `High`, `Critical`).
- Client and project linkage with resolution status tracking.

### 9. 💡 Idea Vault & Services Catalog
- **Idea Vault**: Curate industry verticals, pain points, market opportunities, and SaaS or service concepts with effort scoring (`Low`, `Medium`, `High`).
- **Service Rate Cards**: Pre-configured agency packages (e.g., MVP Sprint, UI/UX System, Retainers) with instant scope copy-to-clipboard.

### 10. 🔐 Role-Based Access Control (RBAC)
- Built-in profile switching between:
  - **Admin / Agency Owner**: Full financial metrics, strategy tools, team management, and idea vault.
  - **Lead Generation Specialist**: Focused pipeline view, communication activities, and lead qualification.
  - **Developer**: Direct focus on assigned projects, sprint tasks, defect triage, and time tracking.

---

## 🏗 Architecture & Backend Overview

> ### 💡 Is there a backend implemented?
> **Yes, FreelanceOS features a complete full-stack backend architecture!**

FreelanceOS uses Next.js Route Handlers and Prisma ORM to provide a resilient, self-healing backend:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Frontend                        │
│          Next.js 16 App Router (React 19 + Tailwind)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Fetch / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Layer                         │
│   27 Route Handlers under /app/api/* (RESTful CRUD)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     CRM Service Layer                       │
│      lib/crm-service.ts (Dual-Engine Orchestrator)          │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
    [PostgreSQL Available]          [Database Offline / Mock]
                ▼                             ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│         Prisma ORM          │ │      In-Memory Store        │
│   PostgreSQL Connection     │ │  Realistic Seed Dataset     │
│   Persistent Production DB  │ │  Zero-Config Local/Preview  │
└─────────────────────────────┘ └─────────────────────────────┘
```

### 1. REST API Route Handlers (`app/api/`)
Over 25+ dedicated endpoints covering all application entities:
- `/api/clients` & `/api/clients/[id]`
- `/api/projects`, `/api/projects/[id]`, `/api/projects/[id]/milestones`, `/api/projects/[id]/downpayment`
- `/api/leads`, `/api/leads/[id]`, `/api/leads/[id]/activities`, `/api/leads/[id]/convert`
- `/api/tasks`, `/api/tasks/[id]`, `/api/tasks/reorder`
- `/api/invoices`, `/api/invoices/[id]`
- `/api/time-entries`, `/api/time-entries/[id]`
- `/api/issues`, `/api/issues/[id]`
- `/api/industries`, `/api/industries/[id]`, `/api/industries/[id]/ideas`
- `/api/dashboard`, `/api/users`, `/api/seed`

### 2. Prisma Database Schema (`prisma/schema.prisma`)
A normalized relational database schema modeling:
- `User` (Role-based authentication & hourly rate)
- `Client` (Company metadata, billing, relationships)
- `Lead` & `LeadActivity` (CRM pipeline & communication channels)
- `Project`, `ProjectMilestone`, `ProjectTeamMember` (Work delivery)
- `Task` (Sprint management & assignees)
- `TimeEntry` (Timesheets & billable calculations)
- `Invoice` & `InvoiceItem` (Financial accounting)
- `Issue` (QA defect management)
- `Industry` & `IndustryIdea` (Strategy & concepts)
- `ActivityLog` (Audit trail)

### 3. Dual-Mode Fallback Engine
When developing locally without Postgres, or when previewing on platforms like Vercel without a database, `checkDb()` in `lib/crm-service.ts` detects database availability. If unreachable, it smoothly falls back to an extensive in-memory state engine pre-loaded with realistic agency data, ensuring that the app **never crashes or blocks developers**.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with CSS Variables |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) / [Base UI](https://base-ui.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Database ORM** | [Prisma 6](https://www.prisma.io/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (Supabase, Neon, Docker, or Local) |
| **Date Utilities** | [date-fns](https://date-fns.org/) |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) (Dark mode default) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later
- **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`
- **PostgreSQL** *(Optional)*: Required only if you want persistent database storage.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/freelance-os.git
cd freelance-os
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Environment Variables
Create a local `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
# Optional: Connect PostgreSQL (leave blank or default for in-memory mock mode)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/freelancer_crm?schema=public"

# App Branding & Defaults
NEXT_PUBLIC_APP_NAME="FreelanceOS CRM"
NEXT_PUBLIC_DEFAULT_CURRENCY="USD"
NEXT_PUBLIC_HOURLY_RATE="120"
```

### 4. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **Notice**: The app will start immediately with rich sample data! If PostgreSQL is not running, the built-in mock fallback engine automatically activates.

---

## 🗄️ Database Setup (Optional)

To enable persistent data storage using PostgreSQL:

### 1. Start a Local PostgreSQL Instance (or use Supabase / Neon)
Using Docker:
```bash
docker run --name freelance-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=freelancer_crm -p 5432:5432 -d postgres:16
```

### 2. Push Prisma Schema to Database
```bash
pnpm prisma:push
```

### 3. (Optional) Seed the Database
You can seed your database via the API endpoint:
```bash
curl -X POST http://localhost:3000/api/seed
```
Or open [Prisma Studio](https://www.prisma.io/studio) to inspect your data:
```bash
pnpm prisma:studio
```

---

## 📁 Project Structure

```text
├── app/
│   ├── api/                 # 27 REST API Route Handlers
│   │   ├── clients/         # Client CRUD endpoints
│   │   ├── projects/        # Projects, milestones, downpayment endpoints
│   │   ├── leads/           # Leads, activities, conversion endpoints
│   │   ├── tasks/           # Tasks CRUD & Kanban reordering
│   │   ├── invoices/        # Invoicing & billing endpoints
│   │   ├── time-entries/    # Time tracking logs
│   │   ├── issues/          # QA bug defect triage
│   │   ├── industries/      # Idea vault & industry verticals
│   │   ├── dashboard/       # Aggregated executive KPIs
│   │   ├── users/           # Team members & RBAC
│   │   └── seed/            # Database initialization
│   ├── clients/             # Clients directory & [id] profile pages
│   ├── leads/               # Leads pipeline & [id] activity log pages
│   ├── projects/            # Projects dashboard & milestone manager
│   ├── tasks/               # Kanban & table task board
│   ├── invoices/            # Invoice generator & previewer
│   ├── time-tracker/        # Billable stop-clock & timesheet
│   ├── qa-issues/           # QA defect tracking board
│   ├── services/            # Agency rate cards & package calculator
│   ├── ideas/               # Startup & service idea vault
│   ├── team/                # Team member directory
│   ├── layout.tsx           # App shell with Sidebar, TopNav, MobileNav
│   ├── globals.css          # Tailwind CSS v4 design tokens
│   └── page.tsx             # Main dashboard
├── components/
│   ├── ui/                  # 40+ customized Radix / Shadcn UI components
│   ├── app-sidebar.tsx      # Role-tailored desktop sidebar
│   ├── top-nav.tsx          # Sticky top navigation with timer & quick action
│   ├── mobile-bottom-nav.tsx# Mobile bottom navigation bar & drawer
│   ├── auth-context.tsx     # Role switcher & user profile context
│   ├── timer-context.tsx    # Global timer provider & state
│   ├── quick-action-dialog.tsx # Universal creation dialog
│   └── theme-provider.tsx   # Light/Dark mode provider
├── lib/
│   ├── crm-service.ts       # 2,900+ lines core service logic (DB + Mock engine)
│   ├── prisma.ts            # Safe Prisma client instantiation
│   ├── types.ts             # TypeScript interfaces & enums
│   └── utils.ts             # Class merging & style helpers
├── prisma/
│   └── schema.prisma        # Complete PostgreSQL database schema
└── public/                  # Static assets & icons
```

---

## 🤝 Contributing

Contributions, bug reports, and feature proposals are welcome!

1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feat/amazing-feature`)
3. **Commit your Changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to the Branch** (`git push origin feat/amazing-feature`)
5. **Open a Pull Request**

### Code Standards
- Keep components typed with TypeScript.
- Follow the existing project structure and styling conventions.
- Format code before submitting:
  ```bash
  pnpm format
  ```

---

## 🗺 Roadmap

- [ ] **Production Auth**: NextAuth.js / Auth.js / Supabase Auth integration with multi-tenant organizations.
- [ ] **Payment Gateways**: Stripe / LemonSqueezy webhook integration for automated invoice payment collection.
- [ ] **Cloud Storage**: AWS S3 or Uploadthing integration for invoice receipts and client contract uploads.
- [ ] **Automated Invoicing**: Scheduled recurring invoices and automatic email reminders.
- [ ] **Client Portal**: Read-only authenticated link for clients to track milestones and approve deliverables.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use it for personal or commercial projects.

---

<div align="center">
  Crafted with ❤️ for freelancers and indie creators worldwide.
</div>
