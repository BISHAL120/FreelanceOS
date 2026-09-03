"use client"

import React, { useEffect, useState } from 'react'
import {
  ShieldAlert,
  Plus,
  Bug,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FolderKanban,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Issue, IssueType, IssueSeverity, IssueStatus, Project, Client } from '@/lib/types'

export default function QaIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<IssueType>('BUG')
  const [severity, setSeverity] = useState<IssueSeverity>('MEDIUM')
  const [status, setStatus] = useState<IssueStatus>('OPEN')
  const [projectId, setProjectId] = useState('')

  const fetchData = async () => {
    try {
      const [iRes, pRes, cRes] = await Promise.all([
        fetch('/api/issues'),
        fetch('/api/projects'),
        fetch('/api/clients'),
      ])
      if (iRes.ok) setIssues(await iRes.json())
      if (pRes.ok) setProjects(await pRes.json())
      if (cRes.ok) setClients(await cRes.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          severity,
          status,
          projectId: projectId || null,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setTitle('')
        setDescription('')
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (id: string, newStatus: IssueStatus) => {
    try {
      await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchData()
    } catch {
      // ignore
    }
  }

  const deleteIssue = async (id: string) => {
    try {
      await fetch(`/api/issues/${id}`, { method: 'DELETE' })
      fetchData()
    } catch {
      // ignore
    }
  }

  const filteredIssues = issues.filter((iss) => {
    if (statusFilter === 'ALL') return true
    return iss.status === statusFilter
  })

  const openCount = issues.filter((i) => i.status === 'OPEN').length
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
            Deliverables QA & Bug Triage
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track client feedback, defects, change requests, and questions to ensure smooth handoffs.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Log Issue / Feedback
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between bg-card/70">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Open Issues</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{openCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between bg-card/70">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Critical Severity</p>
            <h3 className="text-2xl font-bold mt-1 text-destructive">{criticalCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between bg-card/70">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Resolved</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600">{resolvedCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="text-xs h-8 capitalize"
          >
            {s.toLowerCase().replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <Card className="p-12 text-center text-xs text-muted-foreground">
            No QA issues found for this filter.
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <Card key={issue.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xs transition">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      issue.severity === 'CRITICAL'
                        ? 'destructive'
                        : issue.severity === 'HIGH'
                        ? 'destructive'
                        : issue.severity === 'MEDIUM'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-[10px] h-4 font-normal"
                  >
                    {issue.severity}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] h-4 font-normal">
                    {issue.type}
                  </Badge>
                  <span className="font-semibold text-sm text-foreground">{issue.title}</span>
                </div>
                {issue.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                  {issue.projectTitle && (
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <FolderKanban className="h-3 w-3 text-primary" /> {issue.projectTitle}
                    </span>
                  )}
                  {issue.clientName && <span>• {issue.clientName}</span>}
                  <span>• Logged {new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 border-t sm:border-0 pt-2 sm:pt-0">
                <Select
                  value={issue.status}
                  onValueChange={(val) => val && updateStatus(issue.id, val as IssueStatus)}
                >
                  <SelectTrigger className="h-8 text-xs w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <button
                  onClick={() => deleteIssue(issue.id)}
                  className="text-muted-foreground/40 hover:text-destructive transition p-1"
                  title="Delete issue"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Issue Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Log QA Issue or Client Feedback</DialogTitle>
            <DialogDescription>Track defects, change requests, or pre-launch checks.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateIssue} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title / Defect Summary *</label>
              <Input
                required
                placeholder="e.g. Mobile checkout fails with 400 error"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <Select value={type} onValueChange={(v) => v && setType(v as IssueType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUG">Bug</SelectItem>
                    <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                    <SelectItem value="FEEDBACK">Feedback</SelectItem>
                    <SelectItem value="QUESTION">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Severity</label>
                <Select value={severity} onValueChange={(v) => v && setSeverity(v as IssueSeverity)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Linked Project</label>
              <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Steps to Reproduce / Details</label>
              <Textarea
                placeholder="Environment, URL, expected behavior vs observed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Log Issue'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
