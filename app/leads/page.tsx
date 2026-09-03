"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  Trash2,
  User as UserIcon,
  X,
  Building2,
  Search,
  Kanban,
  Table as TableIcon,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import type { Lead, LeadStage } from '@/lib/types'

export const STAGES: { key: LeadStage; label: string }[] = [
  { key: 'NEW', label: 'New Inbound' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { key: 'NEGOTIATING', label: 'Negotiating' },
  { key: 'WON', label: 'Won' },
  { key: 'LOST', label: 'Lost' },
]

export default function LeadsPage() {
  const router = useRouter()
  const { currentUser, users, isAdmin, isLeadGen } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // View mode: Kanban vs Table
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('ALL')
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL')

  // New lead form states
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dealValue, setDealValue] = useState('5000')
  const [source, setSource] = useState('Referral')
  const [stage, setStage] = useState<LeadStage>('NEW')
  const [assignedToId, setAssignedToId] = useState('')
  const [notes, setNotes] = useState('')

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads')
      if (res.ok) {
        const data = await res.json()
        setLeads(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const assignedUser = users.find((u) => u.id === assignedToId)
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          dealValue: parseFloat(dealValue) || 0,
          source,
          stage,
          notes,
          assignedToId: assignedToId || currentUser.id,
          assignedToName: assignedUser ? assignedUser.name : currentUser.name,
        }),
      })

      if (res.ok) {
        setDialogOpen(false)
        setName('')
        setCompany('')
        setEmail('')
        setPhone('')
        setNotes('')
        fetchLeads()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const updateLeadStage = async (id: string, newStage: LeadStage) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      fetchLeads()
    } catch {
      // ignore
    }
  }

  const advanceStage = (lead: Lead, direction: 'next' | 'prev') => {
    const currentIndex = STAGES.findIndex((s) => s.key === lead.stage)
    if (currentIndex === -1) return
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex >= 0 && newIndex < STAGES.length) {
      updateLeadStage(lead.id, STAGES[newIndex].key)
    }
  }

  const convertToClient = async (id: string) => {
    if (!confirm('Convert this qualified lead into an active Client & kickoff Project?')) return
    try {
      const res = await fetch(`/api/leads/${id}/convert`, { method: 'POST' })
      if (res.ok) {
        fetchLeads()
      }
    } catch {
      // ignore
    }
  }

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.company && l.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.notes && l.notes.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStage = stageFilter === 'ALL' || l.stage === stageFilter
      const matchesOwner = ownerFilter === 'ALL' || l.assignedToId === ownerFilter

      return matchesSearch && matchesStage && matchesOwner
    })
  }, [leads, searchQuery, stageFilter, ownerFilter])

  // Financial statistics
  const totalPipeline = leads
    .filter((l) => l.stage !== 'LOST' && l.stage !== 'WON')
    .reduce((acc, l) => acc + l.dealValue, 0)

  const activeDeals = leads.filter((l) => l.stage !== 'WON' && l.stage !== 'LOST').length
  const wonDeals = leads.filter((l) => l.stage === 'WON').length
  const wonValue = leads.filter((l) => l.stage === 'WON').reduce((acc, l) => acc + l.dealValue, 0)

  return (
    <div className="space-y-5 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-sans">
            Leads & Deals
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your pipeline stages, prospective clients, and deal progression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="inline-flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                viewMode === 'kanban'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" /> Pipeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" /> Table
            </button>
          </div>

          <Button onClick={() => setDialogOpen(true)} size="sm" className="h-8 gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> New Lead
          </Button>
        </div>
      </div>

      {/* Summary Stats - Compact 3-Column on Mobile */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        <div className="p-2 sm:p-3.5 rounded-lg border border-border bg-card">
          <span className="text-[10px] sm:text-[11px] text-muted-foreground block font-medium">Pipeline Value</span>
          <div className="text-base sm:text-xl font-semibold mt-0.5 text-foreground font-mono truncate">
            ${totalPipeline.toLocaleString()}
          </div>
          <span className="text-[9px] sm:text-[11px] text-muted-foreground truncate block">{activeDeals} active</span>
        </div>

        <div className="p-2 sm:p-3.5 rounded-lg border border-border bg-card">
          <span className="text-[10px] sm:text-[11px] text-muted-foreground block font-medium">Closed Won</span>
          <div className="text-base sm:text-xl font-semibold mt-0.5 text-foreground font-mono truncate">
            ${wonValue.toLocaleString()}
          </div>
          <span className="text-[9px] sm:text-[11px] text-muted-foreground truncate block">{wonDeals} won</span>
        </div>

        <div className="p-2 sm:p-3.5 rounded-lg border border-border bg-card">
          <span className="text-[10px] sm:text-[11px] text-muted-foreground block font-medium">Win Rate</span>
          <div className="text-base sm:text-xl font-semibold mt-0.5 text-foreground font-mono truncate">
            {leads.length > 0 ? Math.round((wonDeals / leads.length) * 100) : 0}%
          </div>
          <span className="text-[9px] sm:text-[11px] text-muted-foreground truncate block">{leads.length} total</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Select value={stageFilter} onValueChange={(v) => v && setStageFilter(v)}>
            <SelectTrigger className="h-8 text-xs w-[120px] sm:w-[130px]">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Stages</SelectItem>
              {STAGES.map((s) => (
                <SelectItem key={s.key} value={s.key} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ownerFilter} onValueChange={(v) => v && setOwnerFilter(v)}>
            <SelectTrigger className="h-8 text-xs w-[120px] sm:w-[140px]">
              <SelectValue placeholder="All Owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Owners</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id} className="text-xs">
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(stageFilter !== 'ALL' || ownerFilter !== 'ALL' || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStageFilter('ALL')
                setOwnerFilter('ALL')
                setSearchQuery('')
              }}
              className="h-8 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Stage Filter Pills */}
      <div className="flex sm:hidden items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
        <Button
          size="sm"
          variant={stageFilter === 'ALL' ? 'default' : 'outline'}
          className="h-7 px-2 text-xs rounded-full shrink-0"
          onClick={() => setStageFilter('ALL')}
        >
          All Stages
        </Button>
        {STAGES.map((s) => {
          const count = leads.filter((l) => l.stage === s.key).length
          return (
            <Button
              key={s.key}
              size="sm"
              variant={stageFilter === s.key ? 'default' : 'outline'}
              className="h-7 px-2 text-xs rounded-full shrink-0"
              onClick={() => setStageFilter(s.key)}
            >
              {s.label} ({count})
            </Button>
          )
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. KANBAN HORIZONTAL PIPELINE                            */}
      {/* ======================================================== */}
      {viewMode === 'kanban' && (
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-4 pt-1 items-start min-h-[calc(100vh-320px)] snap-x snap-mandatory px-0.5">
          {STAGES.map((stageItem) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stageItem.key)
            const stageTotal = stageLeads.reduce((acc, l) => acc + l.dealValue, 0)

            return (
              <div
                key={stageItem.key}
                className="w-[85vw] sm:w-[280px] min-w-[85vw] sm:min-w-[280px] max-w-[320px] sm:max-w-[280px] shrink-0 snap-center flex flex-col rounded-lg border border-border bg-muted/20"
              >
                {/* Column Header - Clean, No Thick Rainbow Borders */}
                <div className="p-3 border-b border-border bg-card/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/50" />
                    <span className="font-medium text-xs text-foreground">
                      {stageItem.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      ({stageLeads.length})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground font-medium">
                    ${stageTotal.toLocaleString()}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="p-2 space-y-2 flex-1 max-h-[calc(100vh-390px)] overflow-y-auto">
                  {stageLeads.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground/60">
                      No leads
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const isOverdue =
                        lead.nextFollowUp &&
                        new Date(lead.nextFollowUp).getTime() < Date.now()

                      return (
                        <div
                          key={lead.id}
                          onClick={() => router.push(`/leads/${lead.id}`)}
                          className="p-3 rounded-md border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition cursor-pointer space-y-2"
                        >
                          {/* Top: Name & Deal Value */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-xs text-foreground truncate hover:underline">
                                {lead.name}
                              </h3>
                              {lead.company && (
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {lead.company}
                                </p>
                              )}
                            </div>
                            <span className="font-mono text-xs font-semibold text-foreground shrink-0">
                              ${lead.dealValue.toLocaleString()}
                            </span>
                          </div>

                          {/* Notes */}
                          {lead.notes && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2">
                              {lead.notes}
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground pt-1">
                            <span>{lead.assignedToName || 'Unassigned'}</span>

                            {lead.nextFollowUp && (
                              <span className={`font-mono ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                                {new Date(lead.nextFollowUp).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                              </span>
                            )}
                          </div>

                          {/* Quick Stage Controls */}
                          <div
                            className="pt-2 border-t border-border/60 flex items-center justify-between text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => advanceStage(lead, 'prev')}
                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                                title="Previous stage"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => advanceStage(lead, 'next')}
                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                                title="Next stage"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>

                            {lead.stage !== 'WON' ? (
                              <button
                                onClick={() => convertToClient(lead.id)}
                                className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                              >
                                Convert
                              </button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-medium">
                                Won ✓
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TABLE VIEW                                            */}
      {/* ======================================================== */}
      {viewMode === 'table' && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="p-3">Prospect</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3">Deal Value</th>
                  <th className="p-3">Follow-Up</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No leads match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      className="hover:bg-muted/20 transition cursor-pointer"
                    >
                      <td className="p-3 font-medium text-foreground">{lead.name}</td>
                      <td className="p-3 text-muted-foreground">{lead.company || '—'}</td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={lead.stage}
                          onValueChange={(val) => val && updateLeadStage(lead.id, val as LeadStage)}
                        >
                          <SelectTrigger className="h-7 text-[11px] w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((s) => (
                              <SelectItem key={s.key} value={s.key} className="text-xs">
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 font-mono font-medium text-foreground">
                        ${lead.dealValue.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3 text-muted-foreground">{lead.assignedToName || 'Unassigned'}</td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => router.push(`/leads/${lead.id}`)}
                        >
                          Open →
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* NEW PROSPECT DIALOG                                      */}
      {/* ======================================================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">New Prospect</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new lead to your sales pipeline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLead} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Contact Name *</label>
                <Input
                  placeholder="Julian Ramirez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-xs mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium">Company</label>
                <Input
                  placeholder="Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Email *</label>
                <Input
                  type="email"
                  placeholder="julian@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium">Phone</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Deal Value ($) *</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  className="h-8 text-xs mt-1 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium">Stage</label>
                <Select value={stage} onValueChange={(val) => val && setStage(val as LeadStage)}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.key} value={s.key} className="text-xs">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Source</label>
                <Select value={source} onValueChange={(val) => val && setSource(val)}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Referral" className="text-xs">Referral</SelectItem>
                    <SelectItem value="LinkedIn" className="text-xs">LinkedIn</SelectItem>
                    <SelectItem value="Website" className="text-xs">Website</SelectItem>
                    <SelectItem value="Upwork" className="text-xs">Upwork</SelectItem>
                    <SelectItem value="Cold Outreach" className="text-xs">Cold Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Owner</label>
                <Select value={assignedToId} onValueChange={(val) => val && setAssignedToId(val)}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-xs">
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Notes</label>
              <Textarea
                placeholder="Initial prospect details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs mt-1 min-h-[50px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="text-xs">
                {submitting ? 'Adding...' : 'Add Lead'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
