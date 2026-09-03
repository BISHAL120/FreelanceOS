"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  Send,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  User as UserIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import type { Lead, LeadStage, LeadActivity, LeadActivityType } from '@/lib/types'

const STAGES: { key: LeadStage; label: string }[] = [
  { key: 'NEW', label: 'New Inbound' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { key: 'NEGOTIATING', label: 'Negotiating' },
  { key: 'WON', label: 'Won' },
  { key: 'LOST', label: 'Lost' },
]

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { currentUser, isAdmin } = useAuth()

  const [lead, setLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Composer states
  const [actType, setActType] = useState<LeadActivityType>('MESSAGE_SENT')
  const [actTitle, setActTitle] = useState('')
  const [actContent, setActContent] = useState('')
  const [actImage, setActImage] = useState<string | null>(null)
  const [nextFollowUpDate, setNextFollowUpDate] = useState('')
  const [loggingActivity, setLoggingActivity] = useState(false)

  const fetchLeadData = async () => {
    try {
      const [lRes, aRes] = await Promise.all([
        fetch(`/api/leads/${id}`),
        fetch(`/api/leads/${id}/activities`),
      ])
      if (lRes.ok) {
        const lData = await lRes.json()
        setLead(lData)
        if (lData.nextFollowUp) {
          setNextFollowUpDate(lData.nextFollowUp.split('T')[0])
        }
      }
      if (aRes.ok) {
        setActivities(await aRes.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchLeadData()
  }, [id])

  const updateLeadStage = async (newStage: LeadStage) => {
    if (!lead) return
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      setLead((prev) => (prev ? { ...prev, stage: newStage } : null))
    } catch {
      // ignore
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setActImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lead || !actTitle) return
    setLoggingActivity(true)

    try {
      const res = await fetch(`/api/leads/${lead.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: actType,
          title: actTitle,
          content: actContent,
          imageUrl: actImage,
          authorName: currentUser.name,
          authorId: currentUser.id,
          nextFollowUp: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null,
        }),
      })

      if (res.ok) {
        if (nextFollowUpDate) {
          await fetch(`/api/leads/${lead.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nextFollowUp: new Date(nextFollowUpDate).toISOString(),
            }),
          })
        }

        setActTitle('')
        setActContent('')
        setActImage(null)
        fetchLeadData()
      }
    } catch {
      // ignore
    } finally {
      setLoggingActivity(false)
    }
  }

  const convertToClient = async () => {
    if (!lead || !confirm('Convert this lead into an active client?')) return
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.client?.id) {
          router.push(`/clients/${data.client.id}`)
        } else {
          router.push('/clients')
        }
      }
    } catch {
      // ignore
    }
  }

  const deleteLead = async () => {
    if (!lead || !confirm('Are you sure you want to delete this lead?')) return
    try {
      await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' })
      router.push('/leads')
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-5 w-24 bg-muted rounded" />
        <div className="h-20 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-80 bg-muted rounded-lg" />
          <div className="md:col-span-2 h-80 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="py-16 text-center space-y-2">
        <h2 className="text-base font-semibold text-foreground">Lead not found</h2>
        <p className="text-xs text-muted-foreground">This lead may have been deleted or archived.</p>
        <Link href="/leads" className="inline-block text-foreground text-xs underline mt-2">
          Return to Leads
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Navigation */}
      <div>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Leads
        </Link>
      </div>

      {/* Header Profile - Simple & Clean */}
      <div className="p-4 rounded-lg border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                {lead.name}
              </h1>
              <span className="font-mono text-base font-semibold text-foreground">
                ${lead.dealValue.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lead.company || 'Individual Prospect'} • Added {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={lead.stage}
              onValueChange={(val) => val && updateLeadStage(val as LeadStage)}
            >
              <SelectTrigger className="h-8 text-xs w-[130px]">
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

            {lead.stage !== 'WON' ? (
              <Button
                onClick={convertToClient}
                size="sm"
                className="h-8 text-xs"
              >
                Convert to Client
              </Button>
            ) : (
              <Badge variant="secondary" className="text-xs font-normal">
                Converted
              </Badge>
            )}

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={deleteLead}
                className="h-8 px-2 text-destructive hover:text-destructive"
                title="Delete lead"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Minimal Stage Stepper - Clean Neutral Line */}
        <div className="pt-3 border-t border-border flex items-center gap-1 overflow-x-auto">
          {STAGES.map((s, idx) => {
            const isCurrent = lead.stage === s.key
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => updateLeadStage(s.key)}
                className={`px-2.5 py-1 rounded text-xs transition whitespace-nowrap ${
                  isCurrent
                    ? 'bg-foreground text-background font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Grid: Clean 2-Column */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column: Details */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card space-y-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
              Contact Info
            </span>

            {lead.email && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Email</span>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <a href={`mailto:${lead.email}`} className="hover:underline">
                    {lead.email}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lead.email)
                      setCopiedEmail(true)
                      setTimeout(() => setCopiedEmail(false), 2000)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    title="Copy email"
                  >
                    {copiedEmail ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            )}

            {lead.phone && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Phone</span>
                <a href={`tel:${lead.phone}`} className="font-medium text-foreground hover:underline">
                  {lead.phone}
                </a>
              </div>
            )}

            {lead.company && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Company</span>
                <span className="font-medium text-foreground">{lead.company}</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg border border-border bg-card space-y-2.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
              Deal Overview
            </span>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Deal Value</span>
              <span className="font-mono font-medium text-foreground">
                ${lead.dealValue.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Owner</span>
              <span className="font-medium text-foreground">{lead.assignedToName || 'Unassigned'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Source</span>
              <span className="text-foreground">{lead.source || 'Referral'}</span>
            </div>

            {lead.nextFollowUp && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Next Follow-Up</span>
                <span className="font-mono text-foreground font-medium">
                  {new Date(lead.nextFollowUp).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {lead.notes && (
            <div className="p-4 rounded-lg border border-border bg-card space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                Notes
              </span>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {lead.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Interaction Form & Timeline */}
        <div className="md:col-span-2 space-y-4">
          {/* Interaction Log Form */}
          <div className="p-4 rounded-lg border border-border bg-card space-y-3">
            <span className="text-xs font-medium text-foreground block">
              Log Activity
            </span>

            <form onSubmit={handleLogActivity} className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Type</label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { type: 'MESSAGE_SENT', label: 'Message Sent' },
                    { type: 'REPLY_RECEIVED', label: 'Reply Received' },
                    { type: 'CALL', label: 'Call' },
                    { type: 'FOLLOW_UP', label: 'Follow-Up' },
                    { type: 'NOTE', label: 'Note' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setActType(item.type as LeadActivityType)}
                      className={`text-xs px-2.5 py-1 rounded border transition ${
                        actType === item.type
                          ? 'bg-foreground text-background font-medium border-foreground'
                          : 'bg-muted/20 text-muted-foreground border-border hover:bg-muted/40'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground">Summary *</label>
                  <Input
                    placeholder="e.g. Sent Milestone Proposal"
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    className="h-8 text-xs mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Next Follow-Up Date</label>
                  <Input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground">Details</label>
                <Textarea
                  placeholder="Notes, discussion points..."
                  value={actContent}
                  onChange={(e) => setActContent(e.target.value)}
                  className="text-xs mt-1 min-h-[60px]"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Attachment (Screenshot, DM, Email)</span>
                  {actImage && (
                    <button
                      type="button"
                      onClick={() => setActImage(null)}
                      className="text-[10px] text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </label>
                <div className="mt-1">
                  {actImage ? (
                    <div className="rounded border border-border overflow-hidden max-h-32 max-w-xs">
                      <img src={actImage} alt="Attachment" className="w-full h-auto object-cover" />
                    </div>
                  ) : (
                    <label className="flex items-center gap-1.5 p-2 rounded border border-dashed border-border hover:bg-muted/30 transition cursor-pointer text-xs text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      <span>Upload screenshot image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" className="h-8 text-xs" disabled={loggingActivity}>
                  {loggingActivity ? 'Saving...' : 'Save Activity'}
                </Button>
              </div>
            </form>
          </div>

          {/* Activity Ledger */}
          <div className="space-y-2.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
              Activity History ({activities.length})
            </span>

            {activities.length === 0 ? (
              <div className="p-6 rounded-lg border border-border text-center text-xs text-muted-foreground">
                No activity entries logged yet.
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((act) => (
                  <div key={act.id} className="p-3 rounded-lg border border-border bg-card space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-normal h-4">
                          {act.type.replace('_', ' ')}
                        </Badge>
                        <span className="font-medium text-xs text-foreground">{act.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(act.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {act.content && (
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap pl-2 border-l border-border">
                        {act.content}
                      </p>
                    )}

                    {act.imageUrl && (
                      <div className="mt-2 rounded border border-border overflow-hidden max-w-sm">
                        <img
                          src={act.imageUrl}
                          alt="Screenshot"
                          className="w-full h-auto object-cover max-h-40"
                        />
                      </div>
                    )}

                    <div className="text-[10px] text-muted-foreground pt-1">
                      <span>By: {act.authorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
