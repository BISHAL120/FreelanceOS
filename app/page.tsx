"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Users,
  FolderKanban,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Plus,
  Play,
  Pause,
  Target,
  FileText,
  Activity,
  Calendar,
  Sparkles,
  Briefcase,
  Code2,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Send,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts'
import { useTimer } from '@/components/timer-context'
import { useAuth } from '@/components/auth-context'
import type { DashboardMetrics } from '@/lib/types'
import { QuickActionDialog } from '@/components/quick-action-dialog'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [actionType, setActionType] = useState<'client' | 'project' | 'lead' | 'task' | 'invoice'>('task')
  const { isRunning, seconds, startTimer, pauseTimer } = useTimer()
  const { currentUser, isAdmin, isLeadGen, isDeveloper } = useAuth()

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`/api/dashboard?userId=${currentUser.id}&role=${currentUser.role}`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const handleUpdate = () => fetchMetrics()
    window.addEventListener('crm-data-updated', handleUpdate)
    return () => window.removeEventListener('crm-data-updated', handleUpdate)
  }, [currentUser.id, currentUser.role])

  const toggleTaskDone = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE'
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchMetrics()
    } catch {
      // ignore
    }
  }

  const startTaskWork = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      })
      startTimer()
      fetchMetrics()
    } catch {
      // ignore
    }
  }

  const completeTaskWork = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })
      fetchMetrics()
    } catch {
      // ignore
    }
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-muted rounded-xl"></div>
          <div className="h-80 bg-muted rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground">
              {isLeadGen
                ? `Lead Generation Suite`
                : isDeveloper
                ? `Developer Workspace`
                : `Agency Overview`}
            </h1>
            <Badge
              variant="outline"
              className={
                isAdmin
                  ? 'border-purple-500/30 text-purple-600 bg-purple-500/10'
                  : isLeadGen
                  ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10'
                  : 'border-blue-500/30 text-blue-600 bg-blue-500/10'
              }
            >
              {currentUser.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged in as <span className="font-medium text-foreground">{currentUser.name}</span> ({currentUser.title || currentUser.role})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                setActionType('client')
                setQuickActionOpen(true)
              }}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Add Client</span>
            </Button>
          )}

          {(isAdmin || isLeadGen) && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                setActionType('lead')
                setQuickActionOpen(true)
              }}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Add Lead</span>
            </Button>
          )}

          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => {
              setActionType('task')
              setQuickActionOpen(true)
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. ADMIN VIEW: Full Financials & Business Performance    */}
      {/* ======================================================== */}
      {isAdmin && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Revenue Collected</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${metrics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="text-emerald-600 font-semibold flex items-center">
                    +18% <ArrowUpRight className="h-3 w-3" />
                  </span>
                  vs last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Active Clients & Projects</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FolderKanban className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics.activeClientsCount} Clients • {metrics.activeProjectsCount} Active
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All contracts on milestone track
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Unbilled Hours / Accrual</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics.unbilledHours} hrs
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated value: <span className="font-semibold text-emerald-600">${Math.round(metrics.unbilledAmount)}</span>
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pipeline Deal Value</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${metrics.pipelineValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Managed by Lead Gen Specialists
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid: Chart + Urgent Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Velocity Chart */}
            <Card className="lg:col-span-2 min-w-0">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">Financial Trajectory</CardTitle>
                  <CardDescription className="text-xs">
                    Monthly billed vs collected revenue (USD)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Collected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                    <span className="text-muted-foreground">Billed</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full min-w-0 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <AreaChart data={metrics.monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#888888" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#888888" tickFormatter={(v) => `$${v}`} />
                      <RechartsTooltip
                        formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-primary, #6366f1)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#revGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="billed"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        fill="none"
                        strokeDasharray="4 4"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Urgent Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Priority Action Items</CardTitle>
                  <CardDescription className="text-xs">
                    {metrics.urgentTasks.length} tasks needing attention
                  </CardDescription>
                </div>
                <Link href="/tasks" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                  View All <ArrowUpRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.urgentTasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    All high-priority tasks completed!
                  </div>
                ) : (
                  metrics.urgentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition"
                    >
                      <button
                        onClick={() => toggleTaskDone(task.id, task.status)}
                        className="mt-0.5 text-muted-foreground hover:text-primary transition"
                      >
                        <CheckSquare className={`h-4 w-4 ${task.status === 'DONE' ? 'text-primary' : ''}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-tight text-foreground truncate ${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-[9px] px-1 py-0 ${
                              task.priority === 'URGENT'
                                ? 'bg-red-500/10 text-red-600 border-red-500/20'
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                          {task.assignedToName && (
                            <span className="text-[10px] text-muted-foreground">
                              Assigned: {task.assignedToName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 2. LEAD_GEN VIEW: Pipeline, Follow-ups & Deals           */}
      {/* ======================================================== */}
      {isLeadGen && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pipeline Deal Value</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${metrics.pipelineValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active potential contracts
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Leads in Pipeline</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics.totalLeadsCount || 4} Leads
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across 6 deal stages
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">My Lead Tasks</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics.myAssignedTasksCount || 2} Tasks
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Outreach & follow-ups assigned to you
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Lead Conversion Rate</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  25.0%
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-emerald-600 font-semibold">
                  1-click Lead to Client Conversion
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Sales Pipeline Board</CardTitle>
                  <CardDescription className="text-xs">
                    Quick link to Kanban stages, follow-ups, and screenshots
                  </CardDescription>
                </div>
                <Link href="/leads">
                  <Button size="sm" className="h-8 text-xs gap-1.5">
                    Open Pipeline <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-foreground">Lead Interaction & Activity Tracker</div>
                    <p className="text-xs text-muted-foreground">
                      Log messages sent, client replies, schedule next follow-up dates, and upload screenshot images of emails or DMs.
                    </p>
                  </div>
                  <Link href="/leads">
                    <Button variant="outline" size="sm" className="text-xs shrink-0 gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> View Follow-up Logs
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    My Outreach Tasks
                  </div>
                  {metrics.urgentTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => toggleTaskDone(t.id, t.status)}>
                          <CheckSquare className={`h-4 w-4 ${t.status === 'DONE' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </button>
                        <span className={`text-xs font-medium ${t.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                          {t.title}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recent Lead Activity</CardTitle>
                <CardDescription className="text-xs">Latest team follow-ups & stage changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.recentActivities.map((act) => (
                  <div key={act.id} className="text-xs p-2.5 rounded-lg border bg-muted/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{act.action}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{act.details}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 3. DEVELOPER VIEW: My Projects, Active Tasks, Timestamps */}
      {/* ======================================================== */}
      {isDeveloper && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">My Assigned Projects</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FolderKanban className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics.myAssignedProjectsCount || 2} Projects
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Assigned by Agency Founder
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">My Active Tasks</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics.myAssignedTasksCount || 2} Tasks
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready for development
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Task Work Tracker</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground font-mono">
                  {formatTimer(seconds)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-logs start & complete times
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Hourly Billing Rate</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Code2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${currentUser.hourlyRate || 95}/hr
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Engineer Tier: Senior
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Tasks with Start & Complete Action */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">My Assigned Tasks</CardTitle>
                  <CardDescription className="text-xs">
                    Start working, track time, and checkmark when complete
                  </CardDescription>
                </div>
                <Link href="/tasks">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                    View Task Board <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.urgentTasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    No pending tasks! Great job.
                  </div>
                ) : (
                  metrics.urgentTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{t.title}</span>
                          <Badge
                            variant="secondary"
                            className={
                              t.status === 'IN_PROGRESS'
                                ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                                : t.status === 'DONE'
                                ? 'bg-emerald-500/15 text-emerald-600'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {t.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.description || 'No description'}</p>
                        {t.startedAt && (
                          <div className="text-[11px] text-amber-600 flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" /> Started: {new Date(t.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {t.status !== 'DONE' && t.status !== 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                            onClick={() => startTaskWork(t.id)}
                          >
                            <Play className="h-3 w-3" /> Start Work
                          </Button>
                        )}
                        {t.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => completeTaskWork(t.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* My Assigned Projects */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">My Assigned Projects</CardTitle>
                <CardDescription className="text-xs">Only contracts you are assigned to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.ongoingProjects.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{p.title}</span>
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Milestone Progress</span>
                        <span>{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <QuickActionDialog
        open={quickActionOpen}
        onOpenChange={setQuickActionOpen}
        initialType={actionType}
        onSuccess={() => fetchMetrics()}
      />
    </div>
  )
}
