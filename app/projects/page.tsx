"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckSquare,
  AlertCircle,
  MoreVertical,
  Trash2,
  Users,
  Code2,
  Layers,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
  User as UserIcon,
  HelpCircle,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/components/auth-context'
import type {
  Project,
  ProjectStatus,
  ProjectBillingType,
  MilestoneStatus,
  MilestonePaymentStatus,
  ProjectMilestone,
  Task,
  Client,
  User,
} from '@/lib/types'

export default function ProjectsPage() {
  const { currentUser, users, isAdmin, isDeveloper } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Selected project for lifecycle / milestone workspace
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks' | 'team'>('milestones')

  // Payment Recording Dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [payingMilestone, setPayingMilestone] = useState<ProjectMilestone | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Stripe')
  const [paymentNote, setPaymentNote] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [recordingPayment, setRecordingPayment] = useState(false)

  // Downpayment Recording Dialog state
  const [downpaymentDialogOpen, setDownpaymentDialogOpen] = useState(false)
  const [downpaymentAmount, setDownpaymentAmount] = useState('')
  const [downpaymentMethod, setDownpaymentMethod] = useState('Stripe')
  const [downpaymentNote, setDownpaymentNote] = useState('')
  const [recordingDownpayment, setRecordingDownpayment] = useState(false)

  // Add Milestone Form state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('')
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('')
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('')
  const [addingMilestone, setAddingMilestone] = useState(false)

  // Add Task to Project Form state
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('')
  const [newTaskMilestoneId, setNewTaskMilestoneId] = useState('')
  const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState('4')
  const [addingTask, setAddingTask] = useState(false)

  // New Project Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('PLANNING')
  const [billingType, setBillingType] = useState<ProjectBillingType>('FIXED')
  const [budget, setBudget] = useState('6000')
  const [hourlyRate, setHourlyRate] = useState('120')
  const [downpaymentPercent, setDownpaymentPercent] = useState('15')
  const [downpaymentPaid, setDownpaymentPaid] = useState(false)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [selectedDeveloperIds, setSelectedDeveloperIds] = useState<string[]>([])
  const [developerRoles, setDeveloperRoles] = useState<Record<string, string>>({})

  const fetchData = async () => {
    try {
      const [pRes, cRes, tRes] = await Promise.all([
        fetch(`/api/projects?userId=${currentUser.id}&role=${currentUser.role}`),
        fetch('/api/clients'),
        fetch(`/api/tasks?userId=${currentUser.id}&role=${currentUser.role}`),
      ])
      if (pRes.ok) {
        const pData = await pRes.json()
        setProjects(pData)
        if (selectedProject) {
          const refreshed = pData.find((p: Project) => p.id === selectedProject.id)
          if (refreshed) setSelectedProject(refreshed)
        }
      }
      if (cRes.ok) {
        const cData = await cRes.json()
        setClients(cData)
        if (cData.length > 0 && !clientId) setClientId(cData[0].id)
      }
      if (tRes.ok) {
        setAllTasks(await tRes.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentUser.id, currentUser.role])

  const calculatedDownpayment =
    billingType === 'FIXED'
      ? Math.round(((parseFloat(budget) || 0) * (parseFloat(downpaymentPercent) || 0)) / 100)
      : 0

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const totalBudget = parseFloat(budget) || 0
      const dpPct = parseFloat(downpaymentPercent) || 0
      const dpAmt = Math.round((totalBudget * dpPct) / 100)

      // Auto-generate realistic milestone stages for Fixed Price projects
      let initialMilestones: Partial<ProjectMilestone>[] = []
      if (billingType === 'FIXED') {
        const remainingBudget = totalBudget - dpAmt
        const midStage = Math.round(remainingBudget * 0.5)
        const finalStage = remainingBudget - midStage

        initialMilestones = [
          {
            title: `Upfront Deposit (${dpPct}%)`,
            description: 'Contract execution deposit to reserve sprint schedule.',
            amount: dpAmt,
            percentage: dpPct,
            dueDate: startDate ? new Date(startDate).toISOString() : null,
            status: downpaymentPaid ? 'COMPLETED' : 'UPCOMING',
            paymentStatus: downpaymentPaid ? 'PAID' : 'UNPAID',
            paidAt: downpaymentPaid ? new Date().toISOString() : null,
            paidAmount: downpaymentPaid ? dpAmt : 0,
            paymentMethod: downpaymentPaid ? 'Stripe' : null,
            paymentNote: downpaymentPaid ? 'Received upon agreement signing' : null,
            order: 1,
          },
          {
            title: 'Milestone 1: Core Architecture & UI Deliverable',
            description: 'System specifications, database schemas, and primary user journeys.',
            amount: midStage,
            percentage: Math.round(((midStage / totalBudget) * 100)),
            dueDate: endDate ? new Date(new Date(endDate).getTime() - 15 * 86400000).toISOString() : null,
            status: 'UPCOMING',
            paymentStatus: 'UNPAID',
            paidAmount: 0,
            order: 2,
          },
          {
            title: 'Milestone 2: Final Integration, QA & Launch',
            description: 'Staging sign-off, end-to-end QA verification, and production handoff.',
            amount: finalStage,
            percentage: Math.round(((finalStage / totalBudget) * 100)),
            dueDate: endDate ? new Date(endDate).toISOString() : null,
            status: 'UPCOMING',
            paymentStatus: 'UNPAID',
            paidAmount: 0,
            order: 3,
          },
        ]
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          clientId,
          status,
          billingType,
          budget: totalBudget,
          hourlyRate: billingType === 'HOURLY' ? parseFloat(hourlyRate) || 120 : null,
          downpaymentPercent: billingType === 'FIXED' ? dpPct : null,
          downpaymentAmount: billingType === 'FIXED' ? dpAmt : null,
          downpaymentPaid,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          progress: 0,
          assignedUserIds: selectedDeveloperIds,
          initialMilestones,
        }),
      })

      if (res.ok) {
        setDialogOpen(false)
        setTitle('')
        setDescription('')
        setSelectedDeveloperIds([])
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const handleRecordMilestonePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !payingMilestone) return
    setRecordingPayment(true)

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/milestones/${payingMilestone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          paidAmount: parseFloat(paymentAmount) || payingMilestone.amount,
          paymentMethod,
          paymentNote,
          paidAt: new Date(paymentDate).toISOString(),
        }),
      })

      if (res.ok) {
        setPaymentDialogOpen(false)
        setPayingMilestone(null)
        setPaymentNote('')
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setRecordingPayment(false)
    }
  }

  const handleRecordDownpayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return
    setRecordingDownpayment(true)

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/downpayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(downpaymentAmount) || selectedProject.downpaymentAmount,
          paymentMethod: downpaymentMethod,
          paymentNote: downpaymentNote,
          paidAt: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setDownpaymentDialogOpen(false)
        setDownpaymentNote('')
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setRecordingDownpayment(false)
    }
  }

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !newMilestoneTitle) return
    setAddingMilestone(true)

    try {
      const amt = parseFloat(newMilestoneAmount) || 0
      const pct = selectedProject.budget > 0 ? Math.round((amt / selectedProject.budget) * 100) : 0

      const res = await fetch(`/api/projects/${selectedProject.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMilestoneTitle,
          description: newMilestoneDescription,
          amount: amt,
          percentage: pct,
          dueDate: newMilestoneDueDate ? new Date(newMilestoneDueDate).toISOString() : null,
          status: 'UPCOMING',
          paymentStatus: 'UNPAID',
        }),
      })

      if (res.ok) {
        setNewMilestoneTitle('')
        setNewMilestoneDescription('')
        setNewMilestoneAmount('')
        setNewMilestoneDueDate('')
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setAddingMilestone(false)
    }
  }

  const handleAddTaskToProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !newTaskTitle) return
    setAddingTask(true)

    try {
      const assignee = users.find((u) => u.id === newTaskAssigneeId)
      const milestone = selectedProject.milestones?.find((m) => m.id === newTaskMilestoneId)

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          projectId: selectedProject.id,
          projectTitle: selectedProject.title,
          clientId: selectedProject.clientId,
          clientName: selectedProject.clientName,
          assignedToId: newTaskAssigneeId || currentUser.id,
          assignedToName: assignee?.name || currentUser.name,
          milestoneId: newTaskMilestoneId || null,
          milestoneTitle: milestone?.title || null,
          estimatedHours: parseFloat(newTaskEstimatedHours) || 4,
          status: 'TODO',
          priority: 'MEDIUM',
        }),
      })

      if (res.ok) {
        setNewTaskTitle('')
        setNewTaskMilestoneId('')
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setAddingTask(false)
    }
  }

  const deleteMilestone = async (milestoneId: string) => {
    if (!selectedProject || !confirm('Delete this milestone?')) return
    try {
      await fetch(`/api/projects/${selectedProject.id}/milestones/${milestoneId}`, { method: 'DELETE' })
      fetchData()
    } catch {
      // ignore
    }
  }

  const updateProgress = async (id: string, newProgress: number) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: newProgress,
          status: newProgress === 100 ? 'COMPLETED' : 'ACTIVE',
        }),
      })
      fetchData()
    } catch {
      // ignore
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project and all its milestone records?')) return
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (selectedProject?.id === id) setSelectedProject(null)
      fetchData()
    } catch {
      // ignore
    }
  }

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
    return true
  })

  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0)
  const totalCollected = projects.reduce((acc, p) => acc + p.spent, 0)
  const balanceRemaining = totalBudget - totalCollected

  const devUsers = users.filter((u) => u.role === 'DEVELOPER')

  const openPaymentModal = (m: ProjectMilestone) => {
    setPayingMilestone(m)
    setPaymentAmount(m.amount.toString())
    setPaymentDate(new Date().toISOString().split('T')[0])
    setPaymentNote(`Remittance for: ${m.title}`)
    setPaymentDialogOpen(true)
  }

  const openDownpaymentModal = (p: Project) => {
    setDownpaymentAmount(p.downpaymentAmount?.toString() || '')
    setDownpaymentNote(`Initial upfront deposit (${p.downpaymentPercent}%) for contract kickoff`)
    setDownpaymentDialogOpen(true)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
              {isDeveloper ? 'My Assigned Projects' : 'Agency Projects & Milestones'}
            </h1>
            <Badge variant="outline" className="text-xs">
              {isDeveloper ? 'Developer Scope' : 'Full Lifecycle & Financials'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage fixed-price contracts with upfront deposits, milestone payment schedules, and task-level developer workflows.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        )}
      </div>

      {/* Financial Lifecycle KPI Cards */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
        <Card className="bg-card shadow-xs border">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Contract Portfolio
              </p>
              <h2 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-foreground font-mono truncate">
                ${totalBudget.toLocaleString()}
              </h2>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs border">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Deposits & Paid
              </p>
              <h2 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-emerald-600 font-mono truncate">
                ${totalCollected.toLocaleString()}
              </h2>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs border">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Balance To Collect
              </p>
              <h2 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-blue-600 font-mono truncate">
                ${balanceRemaining.toLocaleString()}
              </h2>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'PLANNING', 'ACTIVE', 'REVIEW', 'COMPLETED'].map((st) => (
          <Button
            key={st}
            variant={statusFilter === st ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(st)}
            className="text-xs h-8 capitalize font-medium"
          >
            {st.toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full border border-dashed rounded-xl p-12 text-center text-xs text-muted-foreground">
            No projects found matching your view.
          </div>
        ) : (
          filteredProjects.map((project) => {
            const projectMilestones = project.milestones || []
            const paidMilestones = projectMilestones.filter((m) => m.paymentStatus === 'PAID')

            return (
              <Card
                key={project.id}
                className="hover:shadow-md transition flex flex-col justify-between border bg-card cursor-pointer group"
                onClick={() => setSelectedProject(project)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant={
                            project.status === 'ACTIVE'
                              ? 'default'
                              : project.status === 'COMPLETED'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-[10px] h-4 font-normal"
                        >
                          {project.status}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={`text-[10px] h-4 font-semibold ${
                            project.billingType === 'FIXED'
                              ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                              : 'border-blue-500/40 text-blue-600 bg-blue-500/10'
                          }`}
                        >
                          {project.billingType === 'FIXED' ? 'Fixed Milestone Contract' : 'Hourly Rate Retainer'}
                        </Badge>
                      </div>

                      <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition line-clamp-1">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-foreground/80 font-medium">
                        {project.clientName || 'Client'}
                      </CardDescription>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteProject(project.id)
                        }}
                        className="text-muted-foreground/40 hover:text-destructive transition p-1"
                        title="Delete project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                  )}

                  {/* Downpayment Status Chip */}
                  {project.billingType === 'FIXED' && (
                    <div className="p-2.5 rounded-lg border bg-muted/20 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1 font-medium">
                          <CreditCard className="h-3 w-3 text-primary" /> Upfront Downpayment ({project.downpaymentPercent || 0}%)
                        </span>
                        {project.downpaymentPaid ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[10px] font-medium border-emerald-500/20">
                            Paid ${project.downpaymentAmount?.toLocaleString()} ✓
                          </Badge>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openDownpaymentModal(project)
                            }}
                            className="text-[10px] font-semibold text-amber-600 hover:underline bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30"
                          >
                            Deposit Pending (${project.downpaymentAmount?.toLocaleString()})
                          </button>
                        )}
                      </div>

                      {/* Milestone Summary & Timeline Blocks */}
                      {projectMilestones.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                            <span>Milestones Cleared</span>
                            <span className="font-mono font-medium">
                              {paidMilestones.length}/{projectMilestones.length} Paid
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 mt-1">
                            {projectMilestones.slice(0, 3).map((m, idx) => (
                              <div
                                key={m.id || idx}
                                className={`h-1.5 rounded-full ${
                                  m.paymentStatus === 'PAID'
                                    ? 'bg-emerald-500'
                                    : m.status === 'IN_PROGRESS'
                                    ? 'bg-amber-500'
                                    : 'bg-muted'
                                }`}
                                title={`${m.title} - ${m.paymentStatus}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assigned Team Members with Roles */}
                  {project.assignedUserNames && project.assignedUserNames.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Code2 className="h-3 w-3 text-blue-500" /> Working on this project
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.assignedUserNames.map((name, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] font-medium bg-blue-500/10 text-blue-600 border-blue-500/20"
                          >
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Deliverable Progress</span>
                      <span className="font-semibold font-mono">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Financials Summary */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {project.billingType === 'FIXED' ? 'Contract Value' : 'Hourly Budget Cap'}
                      </span>
                      <span className="font-bold text-foreground font-mono">
                        ${project.budget.toLocaleString()}
                        {project.billingType === 'HOURLY' && project.hourlyRate && ` ($${project.hourlyRate}/h)`}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Collected</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        ${project.spent.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between text-xs">
                    <span className="text-primary font-medium flex items-center gap-1 text-[11px]">
                      <Layers className="h-3 w-3" /> View Milestones & Life-Cycle
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* PROJECT LIFECYCLE & MILESTONE WORKSPACE MODAL             */}
      {/* ======================================================== */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[92vh] overflow-y-auto p-3 sm:p-6">
            <DialogHeader className="border-b pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pr-6">
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-bold font-heading">{selectedProject.title}</DialogTitle>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        selectedProject.billingType === 'FIXED'
                          ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                          : 'border-blue-500/40 text-blue-600 bg-blue-500/10'
                      }`}
                    >
                      {selectedProject.billingType === 'FIXED' ? 'Fixed-Price Contract' : 'Hourly Retainer'}
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Client: <strong className="text-foreground">{selectedProject.clientName}</strong> • Target:{' '}
                    {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'TBD'} →{' '}
                    {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Ongoing'}
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">Total Contract Value</span>
                    <span className="text-lg font-bold text-foreground font-mono">
                      ${selectedProject.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Progress Bar */}
              <div className="mt-4 p-3 rounded-xl border bg-muted/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Contract Type</span>
                  <span className="font-medium text-foreground">{selectedProject.billingType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Downpayment</span>
                  <span className={`font-semibold font-mono ${selectedProject.downpaymentPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedProject.downpaymentPaid
                      ? `Paid $${(selectedProject.downpaymentAmount || 0).toLocaleString()} ✓`
                      : `Pending ($${(selectedProject.downpaymentAmount || 0).toLocaleString()})`}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Total Paid to Date</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    ${selectedProject.spent.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Balance Due</span>
                  <span className="font-bold text-blue-600 font-mono">
                    ${(selectedProject.budget - selectedProject.spent).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center gap-2 pt-3 border-t">
                <Button
                  variant={activeTab === 'milestones' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setActiveTab('milestones')}
                >
                  <Layers className="h-3.5 w-3.5 mr-1" /> Milestones & Payment Schedule ({(selectedProject.milestones || []).length})
                </Button>
                <Button
                  variant={activeTab === 'tasks' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setActiveTab('tasks')}
                >
                  <CheckSquare className="h-3.5 w-3.5 mr-1" /> Assigned Tasks & Sprints (
                  {allTasks.filter((t) => t.projectId === selectedProject.id).length})
                </Button>
                <Button
                  variant={activeTab === 'team' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setActiveTab('team')}
                >
                  <Users className="h-3.5 w-3.5 mr-1" /> Team Roles ({(selectedProject.assignedUserNames || []).length})
                </Button>
              </div>
            </DialogHeader>

            {/* TAB 1: MILESTONES & PAYMENTS */}
            {activeTab === 'milestones' && (
              <div className="space-y-6 pt-2">
                {/* Downpayment Banner if pending */}
                {selectedProject.billingType === 'FIXED' && !selectedProject.downpaymentPaid && (
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-xs text-foreground">
                          Upfront Deposit Pending: ${selectedProject.downpaymentAmount?.toLocaleString()} ({selectedProject.downpaymentPercent}%)
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          The client is expected to remit the initial downpayment before milestone execution begins.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                      onClick={() => openDownpaymentModal(selectedProject)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Record Deposit Received
                    </Button>
                  </div>
                )}

                {/* Milestones List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Contract Milestone Stations
                    </h3>
                  </div>

                  {(selectedProject.milestones || []).length === 0 ? (
                    <div className="p-8 border border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-1">
                      <Layers className="h-6 w-6 mx-auto text-muted-foreground/40" />
                      <p>No milestone stations created yet.</p>
                      <p className="text-[11px]">Use the form below to break down this contract into payment deliverables.</p>
                    </div>
                  ) : (
                    (selectedProject.milestones || []).map((m, idx) => (
                      <div
                        key={m.id}
                        className={`p-4 rounded-xl border transition ${
                          m.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-card'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-sm text-foreground truncate">
                                {m.title}
                              </span>
                              <Badge
                                variant={m.paymentStatus === 'PAID' ? 'secondary' : 'outline'}
                                className={`text-[10px] h-4 ${
                                  m.paymentStatus === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold'
                                    : 'text-amber-600 border-amber-500/30'
                                }`}
                              >
                                {m.paymentStatus === 'PAID' ? 'Paid ✓' : 'Payment Pending'}
                              </Badge>
                            </div>

                            {m.description && (
                              <p className="text-xs text-muted-foreground pl-7">{m.description}</p>
                            )}

                            {/* Payment details log */}
                            <div className="pl-7 flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                              {m.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> Due: {new Date(m.dueDate).toLocaleDateString()}
                                </span>
                              )}

                              {m.paymentStatus === 'PAID' && m.paidAt && (
                                <span className="text-emerald-600 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Paid on {new Date(m.paidAt).toLocaleDateString()}{' '}
                                  {m.paymentMethod && `via ${m.paymentMethod}`}
                                </span>
                              )}

                              {m.paymentNote && (
                                <span className="italic text-foreground/80">• "{m.paymentNote}"</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 sm:self-center pl-7 sm:pl-0">
                            <div className="text-right">
                              <span className="text-base font-bold text-foreground font-mono">
                                ${m.amount.toLocaleString()}
                              </span>
                              {m.percentage && (
                                <span className="text-[10px] text-muted-foreground block">
                                  {m.percentage}% of contract
                                </span>
                              )}
                            </div>

                            {m.paymentStatus !== 'PAID' ? (
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => openPaymentModal(m)}
                              >
                                <DollarSign className="h-3.5 w-3.5 mr-0.5" /> Record Payment
                              </Button>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/40">
                                Remitted
                              </Badge>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() => deleteMilestone(m.id)}
                                className="text-muted-foreground/40 hover:text-destructive transition p-1"
                                title="Delete milestone"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Milestone Form */}
                <form onSubmit={handleAddMilestone} className="p-4 rounded-xl border bg-muted/10 space-y-3">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-primary" /> Add New Milestone Station
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-muted-foreground">Milestone Deliverable Title *</label>
                      <Input
                        placeholder="e.g. Milestone 3: Automated Email Trigger Integration"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        className="h-8 text-xs mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Amount ($) *</label>
                      <Input
                        type="number"
                        placeholder="1800"
                        value={newMilestoneAmount}
                        onChange={(e) => setNewMilestoneAmount(e.target.value)}
                        className="h-8 text-xs mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground">Target Completion Date</label>
                      <Input
                        type="date"
                        value={newMilestoneDueDate}
                        onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Scope & Acceptance Criteria</label>
                      <Input
                        placeholder="Brief summary of requirements..."
                        value={newMilestoneDescription}
                        onChange={(e) => setNewMilestoneDescription(e.target.value)}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button type="submit" size="sm" className="h-8 text-xs" disabled={addingMilestone}>
                      {addingMilestone ? 'Adding...' : 'Add Milestone'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: TASKS & SPRINT BREAKDOWN */}
            {activeTab === 'tasks' && (
              <div className="space-y-6 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tasks Linked to this Project
                    </h3>
                  </div>

                  {allTasks.filter((t) => t.projectId === selectedProject.id).length === 0 ? (
                    <div className="p-8 border border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-1">
                      <CheckSquare className="h-6 w-6 mx-auto text-muted-foreground/40" />
                      <p>No tasks linked to this project yet.</p>
                      <p className="text-[11px]">Add developer action items below linked to a specific milestone station.</p>
                    </div>
                  ) : (
                    allTasks
                      .filter((t) => t.projectId === selectedProject.id)
                      .map((task) => (
                        <div key={task.id} className="p-3.5 rounded-xl border bg-card flex items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-xs text-foreground truncate">
                                {task.title}
                              </span>
                              <Badge variant="outline" className="text-[10px] h-4">
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <Badge
                                variant={task.priority === 'URGENT' ? 'destructive' : 'secondary'}
                                className="text-[10px] h-4"
                              >
                                {task.priority}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                              {task.assignedToName && (
                                <span className="flex items-center gap-1 font-medium text-foreground">
                                  <UserIcon className="h-3 w-3 text-primary" /> {task.assignedToName}
                                </span>
                              )}
                              {task.milestoneTitle && (
                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                  <Layers className="h-3 w-3" /> {task.milestoneTitle}
                                </span>
                              )}
                              {task.startedAt && (
                                <span className="text-amber-600 font-mono">
                                  Started: {new Date(task.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                              {task.completedAt && (
                                <span className="text-emerald-600 font-mono">
                                  Completed ✓ ({task.actualHours}h)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Add Task Form */}
                <form onSubmit={handleAddTaskToProject} className="p-4 rounded-xl border bg-muted/10 space-y-3">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-primary" /> Assign Task to Team Member
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground">Task Title *</label>
                    <Input
                      placeholder="e.g. Implement webhook signature verification"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="h-8 text-xs mt-1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground">Assign To</label>
                      <Select value={newTaskAssigneeId} onValueChange={(v) => v && setNewTaskAssigneeId(v)}>
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue placeholder="Select Developer" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id} className="text-xs">
                              {u.name} ({u.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground">Link to Milestone</label>
                      <Select value={newTaskMilestoneId} onValueChange={(v) => v && setNewTaskMilestoneId(v)}>
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue placeholder="Independent / None" />
                        </SelectTrigger>
                        <SelectContent>
                          {(selectedProject.milestones || []).map((m) => (
                            <SelectItem key={m.id} value={m.id} className="text-xs">
                              {m.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground">Est Hours</label>
                      <Input
                        type="number"
                        step="0.5"
                        value={newTaskEstimatedHours}
                        onChange={(e) => setNewTaskEstimatedHours(e.target.value)}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button type="submit" size="sm" className="h-8 text-xs" disabled={addingTask}>
                      {addingTask ? 'Assigning...' : 'Assign Task to Project'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: TEAM ROLES */}
            {activeTab === 'team' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Developers & Teammates Working on this Project
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedProject.teamMembers && selectedProject.teamMembers.length > 0
                    ? selectedProject.teamMembers
                    : (selectedProject.assignedUserNames || []).map((name) => ({
                        userName: name,
                        roleOnProject: 'Engineer',
                        hourlyRate: 85,
                      }))
                  ).map((member, idx) => (
                    <Card key={idx} className="p-3.5 bg-card">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          {member.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-foreground block">{member.userName}</span>
                          <span className="text-[11px] text-muted-foreground block">{member.roleOnProject || 'Developer'}</span>
                          {member.hourlyRate && (
                            <span className="text-[10px] text-emerald-600 font-mono">Rate: ${member.hourlyRate}/hr</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* RECORD MILESTONE PAYMENT MODAL                           */}
      {/* ======================================================== */}
      {payingMilestone && (
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Record Milestone Payment Received</DialogTitle>
              <DialogDescription className="text-xs">
                Log remittance received for <strong className="text-foreground">{payingMilestone.title}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecordMilestonePayment} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Amount Received ($) *</label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="h-8 text-xs mt-1 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Payment Method *</label>
                  <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stripe" className="text-xs">Stripe</SelectItem>
                      <SelectItem value="Bank Wire" className="text-xs">Bank Wire / ACH</SelectItem>
                      <SelectItem value="Wise" className="text-xs">Wise</SelectItem>
                      <SelectItem value="PayPal" className="text-xs">PayPal</SelectItem>
                      <SelectItem value="Crypto" className="text-xs">USDC / Crypto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Date Received</label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-8 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium">Transaction Reference / Notes</label>
                <Textarea
                  placeholder="e.g. Wire reference #NW-9842 confirmed by client"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="text-xs mt-1 min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPaymentDialogOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={recordingPayment} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  {recordingPayment ? 'Saving...' : 'Record Payment Cleared'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* RECORD DOWNPAYMENT MODAL                                 */}
      {/* ======================================================== */}
      {selectedProject && (
        <Dialog open={downpaymentDialogOpen} onOpenChange={setDownpaymentDialogOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Record Upfront Downpayment Deposit</DialogTitle>
              <DialogDescription className="text-xs">
                Log the upfront retainer received for <strong className="text-foreground">{selectedProject.title}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecordDownpayment} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Deposit Amount ($) *</label>
                  <Input
                    type="number"
                    value={downpaymentAmount}
                    onChange={(e) => setDownpaymentAmount(e.target.value)}
                    className="h-8 text-xs mt-1 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Payment Method *</label>
                  <Select value={downpaymentMethod} onValueChange={(v) => v && setDownpaymentMethod(v)}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stripe" className="text-xs">Stripe</SelectItem>
                      <SelectItem value="Bank Wire" className="text-xs">Bank Wire / ACH</SelectItem>
                      <SelectItem value="Wise" className="text-xs">Wise</SelectItem>
                      <SelectItem value="PayPal" className="text-xs">PayPal</SelectItem>
                      <SelectItem value="Crypto" className="text-xs">USDC / Crypto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Deposit Notes / Transaction ID</label>
                <Textarea
                  placeholder="e.g. Initial 15% upfront payment received via Stripe invoice #INV-2026-001"
                  value={downpaymentNote}
                  onChange={(e) => setDownpaymentNote(e.target.value)}
                  className="text-xs mt-1 min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setDownpaymentDialogOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={recordingDownpayment} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  {recordingDownpayment ? 'Recording...' : 'Mark Deposit Paid'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* NEW PROJECT DIALOG (FIXED PRICE + DOWNPAYMENT OPTIONS)    */}
      {/* ======================================================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription className="text-xs">
              Configure contract pricing model, upfront deposit parameters, and developer team assignments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground">Project Title *</label>
              <Input
                placeholder="e.g. Fintech Mobile App & Algolia Storefront"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 h-8 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Client *</label>
              <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.companyName || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CONTRACT BILLING TYPE SELECTOR */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Contract Pricing Model *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingType('FIXED')}
                  className={`p-3 rounded-lg border text-left transition ${
                    billingType === 'FIXED'
                      ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/10'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <span className="font-semibold text-xs text-foreground block">Fixed-Price Contract</span>
                  <span className="text-[10px] text-muted-foreground">
                    Upfront deposit + milestone payment stations
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingType('HOURLY')}
                  className={`p-3 rounded-lg border text-left transition ${
                    billingType === 'HOURLY'
                      ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-500/10'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <span className="font-semibold text-xs text-foreground block">Hourly Retainer</span>
                  <span className="text-[10px] text-muted-foreground">
                    Time & materials billed by developer hours
                  </span>
                </button>
              </div>
            </div>

            {/* FIXED PRICE DETAILS */}
            {billingType === 'FIXED' ? (
              <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Total Fixed Contract ($) *</label>
                    <Input
                      type="number"
                      placeholder="6000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="mt-1 h-8 text-xs font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium">Upfront Deposit (%)</label>
                    <div className="flex items-center gap-1 mt-1">
                      {['10', '15', '20', '25', '50'].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDownpaymentPercent(pct)}
                          className={`text-[10px] px-1.5 py-1 rounded border ${
                            downpaymentPercent === pct
                              ? 'bg-primary text-primary-foreground font-bold'
                              : 'bg-card text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-card border">
                  <span className="text-muted-foreground">Calculated Downpayment Amount:</span>
                  <span className="font-bold font-mono text-emerald-600">${calculatedDownpayment.toLocaleString()}</span>
                </div>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={downpaymentPaid}
                    onChange={(e) => setDownpaymentPaid(e.target.checked)}
                    className="rounded border-input text-primary h-4 w-4"
                  />
                  <span>Initial downpayment already paid upon contract signing</span>
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border bg-muted/20">
                <div>
                  <label className="text-xs font-medium">Hourly Rate ($/hr)</label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Estimated Budget Cap ($)</label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1 h-8 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* DEVELOPER ASSIGNMENTS */}
            <div>
              <label className="text-xs font-medium text-foreground">Assign Developers to Project</label>
              <div className="mt-1 space-y-1.5 border rounded-lg p-2.5 bg-muted/10 max-h-36 overflow-y-auto">
                {devUsers.map((dev) => {
                  const isAssigned = selectedDeveloperIds.includes(dev.id)
                  return (
                    <label
                      key={dev.id}
                      className="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/40 p-1 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{dev.name}</span>
                        <span className="text-[10px] text-muted-foreground">({dev.title})</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={() => {
                          if (isAssigned) {
                            setSelectedDeveloperIds((prev) => prev.filter((id) => id !== dev.id))
                          } else {
                            setSelectedDeveloperIds((prev) => [...prev, dev.id])
                          }
                        }}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      />
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Target Completion</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Scope & Deliverables</label>
              <Textarea
                placeholder="Contract deliverables, sprint goals, or tech stack..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 text-xs min-h-[50px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="text-xs">
                {submitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
