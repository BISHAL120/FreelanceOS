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
  GripVertical,
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

function LeadCardPreview({ lead, targetIndex, stageLabel }: { lead: Lead; targetIndex: number; stageLabel: string }) {
  return (
    <div
      data-kanban-preview="true"
      className="p-3 rounded-md border-2 border-dashed border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-2 ring-primary/20 space-y-2 transition-all duration-150 relative overflow-hidden pointer-events-none select-none animate-in fade-in-50 zoom-in-95"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-primary/25 text-[10px] font-mono text-primary font-medium">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="font-semibold uppercase tracking-wider text-[10px]">Drop Slot</span>
        </span>
        <Badge
          variant="outline"
          className="text-[9px] h-4 px-1.5 border-primary/50 bg-primary/15 text-primary font-mono font-semibold"
        >
          Position #{targetIndex + 1}
        </Badge>
      </div>

      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-xs text-foreground truncate">{lead.name}</h3>
          {lead.company && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{lead.company}</p>
          )}
        </div>
        <span className="font-mono text-xs font-semibold text-primary shrink-0">
          ${lead.dealValue.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground pt-1 border-t border-primary/20">
        <span>{lead.assignedToName || 'Unassigned'}</span>
        {lead.nextFollowUp && (
          <span className="font-mono">
            {new Date(lead.nextFollowUp).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
          </span>
        )}
      </div>

      <div className="text-[9px] font-mono text-primary/80 italic text-center pt-0.5">
        Release to move to {stageLabel}
      </div>
    </div>
  )
}

function LeadCardFaded({ lead, index }: { lead: Lead; index: number }) {
  return (
    <div
      data-kanban-faded="true"
      className="p-3 rounded-md border-2 border-dashed border-primary/40 bg-muted/30 opacity-40 grayscale-[25%] scale-[0.98] transition-all space-y-2 relative pointer-events-none select-none"
    >
      <div className="flex items-center justify-between pb-1 border-b border-border/40 text-[9px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5 italic font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse" />
          Original position (Moving...)
        </span>
        <span className="text-[9px] font-mono opacity-70">#{index + 1}</span>
      </div>

      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-xs text-muted-foreground truncate">{lead.name}</h3>
          {lead.company && (
            <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{lead.company}</p>
          )}
        </div>
        <span className="font-mono text-xs text-muted-foreground/70 shrink-0">
          ${lead.dealValue.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

function LeadCard({
  lead,
  index,
  onDragStart,
  onDragEnd,
  onClick,
  onShiftPrev,
  onShiftNext,
  onConvert,
}: {
  lead: Lead
  index: number
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onClick: () => void
  onShiftPrev: () => void
  onShiftNext: () => void
  onConvert: () => void
}) {
  const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp).getTime() < Date.now()

  return (
    <div
      data-kanban-card="true"
      data-lead-id={lead.id}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="p-3 rounded-md border bg-card hover:border-foreground/30 hover:shadow-xs transition cursor-grab active:cursor-grabbing space-y-2 group border-border"
    >
      {/* Top: Name, Grip & Deal Value */}
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-xs text-foreground truncate group-hover:underline">
            {lead.name}
          </h3>
          {lead.company && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{lead.company}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono text-muted-foreground/50 font-semibold group-hover:text-muted-foreground">
            #{index + 1}
          </span>
          <GripVertical className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 cursor-grab" />
          <span className="font-mono text-xs font-semibold text-foreground">
            ${lead.dealValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Notes */}
      {lead.notes && (
        <p className="text-[11px] text-muted-foreground line-clamp-2">{lead.notes}</p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
        <span>{lead.assignedToName || 'Unassigned'}</span>
        {lead.nextFollowUp && (
          <span className={`font-mono ${isOverdue ? 'text-destructive font-medium' : ''}`}>
            {new Date(lead.nextFollowUp).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Quick Stage Controls */}
      <div
        className="pt-1.5 flex items-center justify-between text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={onShiftPrev}
            disabled={lead.stage === 'NEW'}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition"
            title="Previous stage"
          >
            <ArrowLeft className="h-3 w-3" />
          </button>
          <button
            onClick={onShiftNext}
            disabled={lead.stage === 'LOST'}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition"
            title="Next stage"
          >
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {lead.stage !== 'WON' ? (
          <button
            onClick={onConvert}
            className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
          >
            Convert
          </button>
        ) : (
          <span className="text-[10px] text-muted-foreground font-medium">Won ✓</span>
        )}
      </div>
    </div>
  )
}

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

  // Drag & Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const draggedLead = useMemo(
    () => leads.find((l) => l.id === draggedLeadId) || null,
    [leads, draggedLeadId]
  )

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

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId)
    e.dataTransfer.effectAllowed = 'move'
    requestAnimationFrame(() => setDraggedLeadId(leadId))
  }

  const handleDragEnd = () => {
    setDraggedLeadId(null)
    setDragOverStage(null)
    setDragOverIndex(null)
  }

  const handleContainerDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (dragOverStage !== stage) {
      setDragOverStage(stage)
    }

    const container = e.currentTarget as HTMLElement
    const cards = Array.from(
      container.querySelectorAll<HTMLElement>('[data-kanban-card="true"]')
    )

    if (cards.length === 0) {
      if (dragOverIndex !== 0) setDragOverIndex(0)
      return
    }

    let calculatedIndex = cards.length
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      if (e.clientY < midY) {
        calculatedIndex = i
        break
      }
    }

    if (dragOverIndex !== calculatedIndex) {
      setDragOverIndex(calculatedIndex)
    }
  }

  const handleDrop = async (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId
    const targetIdx = dragOverIndex !== null ? dragOverIndex : 0

    setDraggedLeadId(null)
    setDragOverStage(null)
    setDragOverIndex(null)

    if (!leadId) return

    // Optimistic local update
    setLeads((prev) => {
      const lead = prev.find((l) => l.id === leadId)
      if (!lead) return prev
      if (lead.stage === stage) return prev

      const updatedLead: Lead = { ...lead, stage }
      const remaining = prev.filter((l) => l.id !== leadId)
      const targetLeads = remaining.filter((l) => l.stage === stage)
      const boundedIdx = Math.max(0, Math.min(targetIdx, targetLeads.length))
      targetLeads.splice(boundedIdx, 0, updatedLead)

      return [...remaining.filter((l) => l.stage !== stage), ...targetLeads]
    })

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      })
      fetchLeads()
    } catch {
      fetchLeads()
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
            const isDropTarget = dragOverStage === stageItem.key
            const otherLeads = stageLeads.filter((l) => l.id !== draggedLeadId)
            const targetIdx = Math.max(0, Math.min(dragOverIndex ?? 0, otherLeads.length))

            return (
              <div
                key={stageItem.key}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    if (dragOverStage === stageItem.key) {
                      setDragOverStage(null)
                      setDragOverIndex(null)
                    }
                  }
                }}
                className={`shrink-0 flex flex-col rounded-lg border transition-all ${
                  isDropTarget
                    ? 'border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20'
                    : 'border-border bg-muted/20'
                } w-[85vw] sm:w-[280px] min-w-[85vw] sm:min-w-[280px] max-w-[320px] sm:max-w-[280px] snap-center`}
              >
                {/* Column Header */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    if (dragOverStage !== stageItem.key) setDragOverStage(stageItem.key)
                    if (dragOverIndex !== 0) setDragOverIndex(0)
                  }}
                  onDrop={(e) => handleDrop(e, stageItem.key)}
                  className="p-3 border-b border-border bg-card/50 flex items-center justify-between rounded-t-lg"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        isDropTarget ? 'bg-primary animate-pulse' : 'bg-foreground/50'
                      }`}
                    />
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

                {/* Card Droppable Container */}
                <div
                  onDragOver={(e) => handleContainerDragOver(e, stageItem.key)}
                  onDrop={(e) => handleDrop(e, stageItem.key)}
                  className="p-2 space-y-2 flex-1 max-h-[calc(100vh-390px)] overflow-y-auto min-h-[140px]"
                >
                  {isDropTarget && draggedLead ? (
                    otherLeads.length === 0 ? (
                      <LeadCardPreview lead={draggedLead} targetIndex={0} stageLabel={stageItem.label} />
                    ) : (
                      Array.from({ length: otherLeads.length + 1 }).map((_, slotIdx) => (
                        <React.Fragment key={`slot-${slotIdx}`}>
                          {targetIdx === slotIdx && (
                            <LeadCardPreview
                              lead={draggedLead}
                              targetIndex={slotIdx}
                              stageLabel={stageItem.label}
                            />
                          )}
                          {slotIdx < otherLeads.length && (
                            <LeadCard
                              lead={otherLeads[slotIdx]}
                              index={slotIdx >= targetIdx ? slotIdx + 1 : slotIdx}
                              onDragStart={(e) => handleDragStart(e, otherLeads[slotIdx].id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => router.push(`/leads/${otherLeads[slotIdx].id}`)}
                              onShiftPrev={() => advanceStage(otherLeads[slotIdx], 'prev')}
                              onShiftNext={() => advanceStage(otherLeads[slotIdx], 'next')}
                              onConvert={() => convertToClient(otherLeads[slotIdx].id)}
                            />
                          )}
                        </React.Fragment>
                      ))
                    )
                  ) : stageLeads.length === 0 ? (
                    <div className="h-28 border border-dashed border-border/60 rounded-md flex flex-col items-center justify-center text-center p-3 text-xs text-muted-foreground/60">
                      No leads
                    </div>
                  ) : (
                    stageLeads.map((lead, idx) => {
                      if (lead.id === draggedLeadId) {
                        return <LeadCardFaded key={lead.id} lead={lead} index={idx} />
                      }
                      return (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          index={idx}
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => router.push(`/leads/${lead.id}`)}
                          onShiftPrev={() => advanceStage(lead, 'prev')}
                          onShiftNext={() => advanceStage(lead, 'next')}
                          onConvert={() => convertToClient(lead.id)}
                        />
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
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold normal-case tracking-normal leading-tight">
                  Add New Lead
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Capture a new prospect and drop it into your pipeline.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateLead} className="space-y-5 pt-1">
            {/* Contact Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-muted flex items-center justify-center text-muted-foreground">
                  <UserIcon className="h-3 w-3" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact Details
                </span>
              </div>

              <div>
                <label className="text-xs font-medium">Contact Name *</label>
                <Input
                  placeholder="e.g. Julian Ramirez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Company</label>
                  <Input
                    placeholder="Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="h-9 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Email *</label>
                  <Input
                    type="email"
                    placeholder="julian@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Phone</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>

            {/* Deal Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-muted flex items-center justify-center text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Deal Details
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Deal Value ($) *</label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="h-9 text-xs mt-1 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Stage</label>
                  <Select value={stage} onValueChange={(val) => val && setStage(val as LeadStage)}>
                    <SelectTrigger className="h-9 text-xs mt-1">
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
                    <SelectTrigger className="h-9 text-xs mt-1">
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
                    <SelectTrigger className="h-9 text-xs mt-1">
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
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-muted flex items-center justify-center text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Notes
                </span>
              </div>
              <Textarea
                placeholder="Initial context, budget signals, or next steps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs mt-1 min-h-[70px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="text-xs h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {submitting ? 'Adding...' : 'Add Lead'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
