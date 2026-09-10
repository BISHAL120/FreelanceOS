"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Code2,
  Layers,
  Plus,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Industry,
  IndustryIdea,
  IdeaCategory,
  IdeaStatus,
  IdeaEffort,
} from '@/lib/types'

const EMOJI_PICKS = ['🏋️', '🚗', '💈', '🍽️', '🦷', '🏠', '🚚', '🔧', '🐾', '📸', '🎓', '💼', '💡']

const SECTIONS = [
  { id: 'identity', label: 'Identity', icon: Layers },
  { id: 'pains', label: 'Pain Points', icon: AlertCircle },
  { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
  { id: 'offerings', label: 'Offerings', icon: Code2 },
]

function SectionCard({
  id,
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  id: string
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-3 sm:p-4 flex items-start justify-between gap-3 border-b border-border bg-muted/20">
        <div className="flex items-start gap-3 min-w-0">
          <span className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-3 sm:p-4 space-y-3">{children}</div>
    </section>
  )
}

function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  multiline = false,
  accent = 'primary',
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
  addLabel: string
  multiline?: boolean
  accent?: 'primary' | 'emerald' | 'muted'
}) {
  const dotColor =
    accent === 'emerald' ? 'bg-emerald-500' : accent === 'muted' ? 'bg-muted-foreground/60' : 'bg-primary'

  const updateAt = (idx: number, value: string) => {
    const next = [...items]
    next[idx] = value
    onChange(next)
  }

  const removeAt = (idx: number) => onChange(items.filter((_, i) => i !== idx))

  const addItem = () => onChange([...items, ''])

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <div className="p-4 rounded-lg border border-dashed border-border text-center text-[11px] text-muted-foreground">
          Nothing added yet.
        </div>
      )}

      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor} mt-2.5 shrink-0`} />
          {multiline ? (
            <Textarea
              value={item}
              onChange={(e) => updateAt(idx, e.target.value)}
              placeholder={placeholder}
              className="text-xs min-h-[46px] flex-1"
            />
          ) : (
            <Input
              value={item}
              onChange={(e) => updateAt(idx, e.target.value)}
              placeholder={placeholder}
              className="h-9 text-xs flex-1"
            />
          )}
          <button
            type="button"
            onClick={() => removeAt(idx)}
            className="p-2 rounded text-muted-foreground/50 hover:text-destructive transition shrink-0"
            title="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="h-8 text-xs gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </Button>
    </div>
  )
}

export default function EditIdeaPage() {
  const params = useParams()
  const id = params?.id as string
  const { isAdmin } = useAuth()

  const [industry, setIndustry] = useState<Industry | null>(null)
  const [deletedIdeaIds, setDeletedIdeaIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIndustry = async () => {
    try {
      const res = await fetch(`/api/industries/${id}`)
      if (res.ok) {
        const data: Industry = await res.json()
        setIndustry(data)
      } else {
        setError('Industry not found.')
      }
    } catch {
      setError('Failed to load this industry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchIndustry()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const patchIndustry = (patch: Partial<Industry>) => {
    setIndustry((prev) => (prev ? { ...prev, ...patch } : prev))
    setSaved(false)
  }

  const patchIdea = (ideaId: string, patch: Partial<IndustryIdea>) => {
    setIndustry((prev) =>
      prev
        ? { ...prev, ideas: (prev.ideas || []).map((i) => (i.id === ideaId ? { ...i, ...patch } : i)) }
        : prev
    )
    setSaved(false)
  }

  const addIdea = () => {
    const draft: IndustryIdea = {
      id: `new-${Date.now()}`,
      industryId: id,
      title: '',
      category: 'SOFTWARE',
      status: 'BACKLOG',
      summary: '',
      features: [],
      techStack: [],
      priceRange: '',
      effort: 'MEDIUM',
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setIndustry((prev) => (prev ? { ...prev, ideas: [...(prev.ideas || []), draft] } : prev))
    setSaved(false)
  }

  const removeIdea = (ideaId: string) => {
    setIndustry((prev) =>
      prev ? { ...prev, ideas: (prev.ideas || []).filter((i) => i.id !== ideaId) } : prev
    )
    if (!ideaId.startsWith('new-')) {
      setDeletedIdeaIds((prev) => [...prev, ideaId])
    }
    setSaved(false)
  }

  const handleSave = async () => {
    if (!industry) return
    setSaving(true)
    setError(null)

    try {
      const industryRes = await fetch(`/api/industries/${industry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: industry.name,
          emoji: industry.emoji,
          tagline: industry.tagline,
          painPoints: industry.painPoints,
          opportunities: industry.opportunities,
        }),
      })
      if (!industryRes.ok) throw new Error('Failed to save industry details')

      for (const deletedId of deletedIdeaIds) {
        await fetch(`/api/industries/ideas/${deletedId}`, { method: 'DELETE' })
      }

      for (const idea of industry.ideas || []) {
        const payload = {
          title: idea.title || 'Untitled Idea',
          category: idea.category,
          status: idea.status,
          summary: idea.summary,
          features: idea.features,
          techStack: idea.techStack,
          priceRange: idea.priceRange || 'TBD',
          effort: idea.effort,
          notes: idea.notes || null,
        }

        if (idea.id.startsWith('new-')) {
          await fetch(`/api/industries/${industry.id}/ideas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        } else {
          await fetch(`/api/industries/ideas/${idea.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        }
      }

      setDeletedIdeaIds([])
      await fetchIndustry()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while saving.')
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="py-20 text-center space-y-2">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Admin access only</h2>
        <p className="text-xs text-muted-foreground">
          The Idea Vault is a private strategy space for the agency owner.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-40 bg-muted rounded-lg" />
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    )
  }

  if (!industry) {
    return (
      <div className="py-16 text-center space-y-2">
        <h2 className="text-base font-semibold text-foreground">
          {error || 'Industry not found'}
        </h2>
        <p className="text-xs text-muted-foreground">
          This entry may have been removed from the vault.
        </p>
        <Link href="/ideas" className="inline-block text-foreground text-xs underline mt-2">
          Return to Idea Vault
        </Link>
      </div>
    )
  }

  const ideaCount = (industry.ideas || []).length

  return (
    <div className="space-y-4 pb-6">
      {/* Navigation */}
      <Link
        href="/ideas"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Idea Vault
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-10 w-10 rounded-lg border border-border bg-muted/30 flex items-center justify-center text-xl shrink-0">
            {industry.emoji}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate">
                Edit: {industry.name}
              </h1>
              <Badge variant="secondary" className="text-[10px] h-4 font-normal shrink-0">
                {ideaCount} {ideaCount === 1 ? 'idea' : 'ideas'}
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              Update every detail of this vertical and its offerings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/ideas">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            size="sm"
            disabled={saving}
            className="h-8 text-xs gap-1.5"
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-card text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition whitespace-nowrap"
            >
              <Icon className="h-3 w-3" /> {s.label}
            </a>
          )
        })}
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* 1. Identity */}
      <SectionCard
        id="identity"
        icon={Layers}
        title="Industry Identity"
        description="The vertical name, icon, and the one-line positioning statement."
      >
        <div>
          <label className="text-xs font-medium">Industry Name</label>
          <Input
            value={industry.name}
            onChange={(e) => patchIndustry({ name: e.target.value })}
            placeholder="e.g. Pet Grooming & Vets"
            className="h-9 text-xs mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-medium">Icon</label>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {EMOJI_PICKS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => patchIndustry({ emoji })}
                className={`h-8 w-8 rounded border text-base transition ${
                  industry.emoji === emoji
                    ? 'border-foreground bg-muted'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                {emoji}
              </button>
            ))}
            <Input
              value={industry.emoji}
              onChange={(e) => patchIndustry({ emoji: e.target.value })}
              className="h-8 w-16 text-center text-base"
              maxLength={4}
              title="Custom icon"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium">Tagline / Description</label>
          <Textarea
            value={industry.tagline}
            onChange={(e) => patchIndustry({ tagline: e.target.value })}
            placeholder="Who they are and what is broken for them"
            className="text-xs mt-1 min-h-[60px]"
          />
        </div>
      </SectionCard>

      {/* 2. Pain Points */}
      <SectionCard
        id="pains"
        icon={AlertCircle}
        title="Pain Points"
        description="The specific problems this industry struggles with today."
      >
        <StringListEditor
          items={industry.painPoints}
          onChange={(painPoints) => patchIndustry({ painPoints })}
          placeholder="e.g. Class bookings handled over WhatsApp and DMs"
          addLabel="Add pain point"
          multiline
          accent="muted"
        />
      </SectionCard>

      {/* 3. Opportunities */}
      <SectionCard
        id="opportunities"
        icon={TrendingUp}
        title="Opportunities"
        description="Why this niche is worth targeting and where the value is."
      >
        <StringListEditor
          items={industry.opportunities}
          onChange={(opportunities) => patchIndustry({ opportunities })}
          placeholder="e.g. Recurring monthly memberships create predictable revenue"
          addLabel="Add opportunity"
          multiline
          accent="emerald"
        />
      </SectionCard>

      {/* 4. Offerings & Software Ideas */}
      <SectionCard
        id="offerings"
        icon={Code2}
        title="Offerings & Software Ideas"
        description="Every product or service you could sell this industry."
        action={
          <Button
            onClick={addIdea}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Idea
          </Button>
        }
      >
        {ideaCount === 0 ? (
          <div className="p-6 rounded-lg border border-dashed border-border text-center text-[11px] text-muted-foreground">
            No offerings mapped yet.
            <button
              onClick={addIdea}
              className="block mx-auto mt-2 text-[11px] text-foreground hover:underline font-medium"
            >
              + Add the first idea
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {(industry.ideas || []).map((idea, idx) => (
              <div
                key={idea.id}
                className="rounded-lg border border-border bg-background overflow-hidden"
              >
                {/* Idea header */}
                <div className="p-3 flex items-center justify-between gap-2 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-5 w-5 rounded bg-background border border-border flex items-center justify-center text-[10px] font-mono text-muted-foreground shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {idea.title || 'Untitled Idea'}
                    </span>
                    {idea.id.startsWith('new-') && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-normal shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIdea(idea.id)}
                    className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive transition shrink-0"
                    title="Remove idea"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Idea body */}
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-muted-foreground">Title</label>
                      <Input
                        value={idea.title}
                        onChange={(e) => patchIdea(idea.id, { title: e.target.value })}
                        placeholder="e.g. Booking & No-Show Protection Suite"
                        className="h-9 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Category</label>
                      <Select
                        value={idea.category}
                        onValueChange={(v) => v && patchIdea(idea.id, { category: v as IdeaCategory })}
                      >
                        <SelectTrigger className="h-9 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SOFTWARE" className="text-xs">Software product</SelectItem>
                          <SelectItem value="SERVICE" className="text-xs">Done-for-you service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground">Summary</label>
                    <Textarea
                      value={idea.summary}
                      onChange={(e) => patchIdea(idea.id, { summary: e.target.value })}
                      placeholder="What it does and why the industry will pay for it..."
                      className="text-xs mt-1 min-h-[56px]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground">
                      Features / Deliverables
                    </label>
                    <div className="mt-1">
                      <StringListEditor
                        items={idea.features}
                        onChange={(features) => patchIdea(idea.id, { features })}
                        placeholder="e.g. Online booking with deposits"
                        addLabel="Add feature"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground">
                      Tech Stack
                    </label>
                    <div className="mt-1">
                      <StringListEditor
                        items={idea.techStack}
                        onChange={(techStack) => patchIdea(idea.id, { techStack })}
                        placeholder="e.g. Next.js"
                        addLabel="Add technology"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground">Price Range</label>
                      <Input
                        value={idea.priceRange}
                        onChange={(e) => patchIdea(idea.id, { priceRange: e.target.value })}
                        placeholder="$49–$149 / month"
                        className="h-9 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Status</label>
                      <Select
                        value={idea.status}
                        onValueChange={(v) => v && patchIdea(idea.id, { status: v as IdeaStatus })}
                      >
                        <SelectTrigger className="h-9 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BACKLOG" className="text-xs">Backlog</SelectItem>
                          <SelectItem value="RESEARCHING" className="text-xs">Researching</SelectItem>
                          <SelectItem value="PLANNED" className="text-xs">Planned</SelectItem>
                          <SelectItem value="BUILDING" className="text-xs">Building</SelectItem>
                          <SelectItem value="LAUNCHED" className="text-xs">Launched</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Effort</label>
                      <Select
                        value={idea.effort}
                        onValueChange={(v) => v && patchIdea(idea.id, { effort: v as IdeaEffort })}
                      >
                        <SelectTrigger className="h-9 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW" className="text-xs">Low effort</SelectItem>
                          <SelectItem value="MEDIUM" className="text-xs">Medium effort</SelectItem>
                          <SelectItem value="HIGH" className="text-xs">High effort</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground">Strategy Notes</label>
                    <Textarea
                      value={idea.notes || ''}
                      onChange={(e) => patchIdea(idea.id, { notes: e.target.value })}
                      placeholder="Go-to-market angle, risks, why now..."
                      className="text-xs mt-1 min-h-[56px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-30 -mx-2.5 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2.5 sm:px-4 md:px-6 lg:px-8 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="py-3 flex items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2 min-w-0">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate hidden sm:inline">
              Editing {industry.emoji} {industry.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {saved && (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Changes saved
              </span>
            )}
            <Link href="/ideas">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              size="sm"
              disabled={saving}
              className="h-8 text-xs gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
