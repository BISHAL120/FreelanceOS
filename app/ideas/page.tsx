"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Code2,
  DollarSign,
  Layers,
  Lightbulb,
  Pencil,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  IdeaCategory,
  IdeaStatus,
  IdeaEffort,
} from '@/lib/types'

const IDEA_CATEGORY_LABEL: Record<IdeaCategory, string> = {
  SOFTWARE: 'Software',
  SERVICE: 'Service',
}

const IDEA_STATUS_LABEL: Record<IdeaStatus, string> = {
  BACKLOG: 'Backlog',
  RESEARCHING: 'Researching',
  PLANNED: 'Planned',
  BUILDING: 'Building',
  LAUNCHED: 'Launched',
}

const IDEA_STATUS_STYLES: Record<IdeaStatus, string> = {
  BACKLOG: 'bg-muted text-muted-foreground border-border',
  RESEARCHING: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  PLANNED: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  BUILDING: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  LAUNCHED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
}

const IDEA_EFFORT_LABEL: Record<IdeaEffort, string> = {
  LOW: 'Low effort',
  MEDIUM: 'Medium effort',
  HIGH: 'High effort',
}

const EMOJI_PICKS = ['🏋️', '🚗', '💈', '🍽️', '🦷', '🏠', '🚚', '🔧', '🐾', '📸', '🎓', '💼']

export default function IdeaVaultPage() {
  const { isAdmin } = useAuth()

  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | IdeaCategory>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | IdeaStatus>('ALL')

  // Expand state
  const [collapsedIndustries, setCollapsedIndustries] = useState<string[]>([])
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null)

  // New industry form
  const [industryDialogOpen, setIndustryDialogOpen] = useState(false)
  const [submittingIndustry, setSubmittingIndustry] = useState(false)
  const [newIndustryName, setNewIndustryName] = useState('')
  const [newIndustryEmoji, setNewIndustryEmoji] = useState('💡')
  const [newIndustryTagline, setNewIndustryTagline] = useState('')
  const [newIndustryPains, setNewIndustryPains] = useState('')
  const [newIndustryOpps, setNewIndustryOpps] = useState('')

  // New idea form
  const [ideaDialogOpen, setIdeaDialogOpen] = useState(false)
  const [ideaTargetIndustry, setIdeaTargetIndustry] = useState<Industry | null>(null)
  const [submittingIdea, setSubmittingIdea] = useState(false)
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaCategory, setIdeaCategory] = useState<IdeaCategory>('SOFTWARE')
  const [ideaStatus, setIdeaStatus] = useState<IdeaStatus>('BACKLOG')
  const [ideaSummary, setIdeaSummary] = useState('')
  const [ideaFeatures, setIdeaFeatures] = useState('')
  const [ideaTechStack, setIdeaTechStack] = useState('')
  const [ideaPriceRange, setIdeaPriceRange] = useState('')
  const [ideaEffort, setIdeaEffort] = useState<IdeaEffort>('MEDIUM')
  const [ideaNotes, setIdeaNotes] = useState('')

  const fetchIndustries = async () => {
    try {
      const res = await fetch('/api/industries')
      if (res.ok) {
        setIndustries(await res.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIndustries()
  }, [])

  const handleCreateIndustry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newIndustryName.trim()) return
    setSubmittingIndustry(true)
    try {
      const res = await fetch('/api/industries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newIndustryName.trim(),
          emoji: newIndustryEmoji,
          tagline: newIndustryTagline.trim(),
          painPoints: newIndustryPains
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          opportunities: newIndustryOpps
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })
      if (res.ok) {
        setIndustryDialogOpen(false)
        setNewIndustryName('')
        setNewIndustryEmoji('💡')
        setNewIndustryTagline('')
        setNewIndustryPains('')
        setNewIndustryOpps('')
        fetchIndustries()
      }
    } catch {
      // ignore
    } finally {
      setSubmittingIndustry(false)
    }
  }

  const openIdeaDialog = (industry: Industry) => {
    setIdeaTargetIndustry(industry)
    setIdeaDialogOpen(true)
  }

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ideaTargetIndustry || !ideaTitle.trim()) return
    setSubmittingIdea(true)
    try {
      const res = await fetch(`/api/industries/${ideaTargetIndustry.id}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ideaTitle.trim(),
          category: ideaCategory,
          status: ideaStatus,
          summary: ideaSummary.trim(),
          features: ideaFeatures
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          techStack: ideaTechStack
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          priceRange: ideaPriceRange.trim() || 'TBD',
          effort: ideaEffort,
          notes: ideaNotes.trim() || null,
        }),
      })
      if (res.ok) {
        setIdeaDialogOpen(false)
        setIdeaTitle('')
        setIdeaCategory('SOFTWARE')
        setIdeaStatus('BACKLOG')
        setIdeaSummary('')
        setIdeaFeatures('')
        setIdeaTechStack('')
        setIdeaPriceRange('')
        setIdeaEffort('MEDIUM')
        setIdeaNotes('')
        fetchIndustries()
      }
    } catch {
      // ignore
    } finally {
      setSubmittingIdea(false)
    }
  }

  const handleDeleteIndustry = async (industry: Industry) => {
    if (!window.confirm(`Remove "${industry.name}" and all of its ideas?`)) return
    try {
      await fetch(`/api/industries/${industry.id}`, { method: 'DELETE' })
      fetchIndustries()
    } catch {
      // ignore
    }
  }

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      await fetch(`/api/industries/ideas/${ideaId}`, { method: 'DELETE' })
      fetchIndustries()
    } catch {
      // ignore
    }
  }

  const toggleIndustry = (id: string) => {
    setCollapsedIndustries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Derived stats
  const allIdeas = useMemo(
    () => industries.flatMap((i) => i.ideas || []),
    [industries]
  )

  const softwareCount = allIdeas.filter((i) => i.category === 'SOFTWARE').length
  const serviceCount = allIdeas.filter((i) => i.category === 'SERVICE').length
  const launchedCount = allIdeas.filter((i) => i.status === 'LAUNCHED').length
  const buildingCount = allIdeas.filter((i) => i.status === 'BUILDING').length

  // Filtering
  const hasActiveFilter =
    search.trim() !== '' || categoryFilter !== 'ALL' || statusFilter !== 'ALL'

  const filteredIndustries = useMemo(() => {
    const q = search.trim().toLowerCase()

    return industries
      .map((industry) => {
        const industryMatches =
          !q ||
          industry.name.toLowerCase().includes(q) ||
          industry.tagline.toLowerCase().includes(q) ||
          industry.painPoints.some((p) => p.toLowerCase().includes(q)) ||
          industry.opportunities.some((o) => o.toLowerCase().includes(q))

        const ideas = (industry.ideas || []).filter((idea) => {
          const matchesCategory = categoryFilter === 'ALL' || idea.category === categoryFilter
          const matchesStatus = statusFilter === 'ALL' || idea.status === statusFilter
          const matchesSearch =
            !q ||
            industryMatches ||
            idea.title.toLowerCase().includes(q) ||
            idea.summary.toLowerCase().includes(q) ||
            idea.features.some((f) => f.toLowerCase().includes(q)) ||
            idea.techStack.some((t) => t.toLowerCase().includes(q))

          return matchesCategory && matchesStatus && matchesSearch
        })

        return { industry, ideas }
      })
      .filter(({ ideas }) => !hasActiveFilter || ideas.length > 0)
  }, [industries, search, categoryFilter, statusFilter, hasActiveFilter])

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
        <div className="h-8 w-56 bg-muted rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Lightbulb className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Idea Vault
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Industry verticals worth targeting, and the software or service you can sell each one.
          </p>
        </div>

        <Button
          onClick={() => setIndustryDialogOpen(true)}
          size="sm"
          className="h-8 gap-1.5 text-xs shrink-0"
        >
          <Plus className="h-3.5 w-3.5" /> New Industry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">Industries</span>
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="text-lg sm:text-xl font-semibold mt-1 text-foreground font-mono">
            {industries.length}
          </div>
          <span className="text-[10px] text-muted-foreground">Verticals in the vault</span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">Total Ideas</span>
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="text-lg sm:text-xl font-semibold mt-1 text-foreground font-mono">
            {allIdeas.length}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {softwareCount} software • {serviceCount} services
          </span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">Building</span>
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="text-lg sm:text-xl font-semibold mt-1 text-foreground font-mono">
            {buildingCount}
          </div>
          <span className="text-[10px] text-muted-foreground">Actively in progress</span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">Launched</span>
            <Rocket className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="text-lg sm:text-xl font-semibold mt-1 text-foreground font-mono">
            {launchedCount}
          </div>
          <span className="text-[10px] text-muted-foreground">Shipped to market</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search industries, ideas, tech stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={categoryFilter}
            onValueChange={(v) => v && setCategoryFilter(v as 'ALL' | IdeaCategory)}
          >
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Offerings</SelectItem>
              <SelectItem value="SOFTWARE" className="text-xs">Software</SelectItem>
              <SelectItem value="SERVICE" className="text-xs">Services</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => v && setStatusFilter(v as 'ALL' | IdeaStatus)}
          >
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="BACKLOG" className="text-xs">Backlog</SelectItem>
              <SelectItem value="RESEARCHING" className="text-xs">Researching</SelectItem>
              <SelectItem value="PLANNED" className="text-xs">Planned</SelectItem>
              <SelectItem value="BUILDING" className="text-xs">Building</SelectItem>
              <SelectItem value="LAUNCHED" className="text-xs">Launched</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setCategoryFilter('ALL')
                setStatusFilter('ALL')
              }}
              className="h-8 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Industry Vault */}
      {filteredIndustries.length === 0 ? (
        <div className="p-10 rounded-lg border border-border text-center text-xs text-muted-foreground">
          No industries or ideas match your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIndustries.map(({ industry, ideas }) => {
            const isCollapsed = collapsedIndustries.includes(industry.id)
            const industryTotal = industry.ideas?.length || 0

            return (
              <div
                key={industry.id}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                {/* Industry Header */}
                <div className="p-3 sm:p-4 flex items-start justify-between gap-3 border-b border-border bg-muted/20">
                  <button
                    onClick={() => toggleIndustry(industry.id)}
                    className="flex items-start gap-3 text-left flex-1 min-w-0 group"
                  >
                    <span className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center text-lg shrink-0">
                      {industry.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        <h2 className="text-sm sm:text-base font-semibold text-foreground truncate group-hover:underline">
                          {industry.name}
                        </h2>
                        <Badge variant="secondary" className="text-[10px] h-4 font-normal shrink-0">
                          {industryTotal} {industryTotal === 1 ? 'idea' : 'ideas'}
                        </Badge>
                      </div>
                      {industry.tagline && (
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                          {industry.tagline}
                        </p>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link href={`/ideas/${industry.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px] gap-1"
                        title="Edit all details"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openIdeaDialog(industry)}
                      className="h-7 px-2 text-[11px] gap-1"
                    >
                      <Plus className="h-3 w-3" /> Idea
                    </Button>
                    <button
                      onClick={() => handleDeleteIndustry(industry)}
                      className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive transition"
                      title="Remove industry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-3 sm:p-4 space-y-4">
                    {/* Pain points & opportunities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {industry.painPoints.length > 0 && (
                        <div className="p-3 rounded-lg border border-border bg-muted/20">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                            <AlertCircle className="h-3 w-3" /> Pain Points
                          </span>
                          <ul className="space-y-1.5">
                            {industry.painPoints.map((pain, idx) => (
                              <li
                                key={idx}
                                className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-relaxed"
                              >
                                <span className="h-1 w-1 rounded-full bg-muted-foreground/60 mt-1.5 shrink-0" />
                                <span>{pain}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {industry.opportunities.length > 0 && (
                        <div className="p-3 rounded-lg border border-border bg-emerald-500/5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-500 flex items-center gap-1.5 mb-2">
                            <TrendingUp className="h-3 w-3" /> Opportunities
                          </span>
                          <ul className="space-y-1.5">
                            {industry.opportunities.map((opp, idx) => (
                              <li
                                key={idx}
                                className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-relaxed"
                              >
                                <span className="h-1 w-1 rounded-full bg-emerald-500/70 mt-1.5 shrink-0" />
                                <span>{opp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Ideas */}
                    {ideas.length === 0 ? (
                      <div className="p-6 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                        {industryTotal === 0
                          ? 'No offerings mapped to this industry yet.'
                          : 'No ideas match the current filters.'}
                        <button
                          onClick={() => openIdeaDialog(industry)}
                          className="block mx-auto mt-2 text-[11px] text-foreground hover:underline font-medium"
                        >
                          + Add the first idea
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Code2 className="h-3 w-3" /> Offerings & Software Ideas
                        </span>

                        {ideas.map((idea) => {
                          const isExpanded = expandedIdeaId === idea.id

                          return (
                            <div
                              key={idea.id}
                              className="rounded-lg border border-border bg-background overflow-hidden"
                            >
                              <div
                                onClick={() => setExpandedIdeaId(isExpanded ? null : idea.id)}
                                className="p-3 cursor-pointer hover:bg-muted/20 transition space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                                    {isExpanded ? (
                                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    ) : (
                                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    )}
                                    <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                                      {idea.title}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <Badge
                                      variant={idea.category === 'SOFTWARE' ? 'default' : 'secondary'}
                                      className="text-[9px] h-4 px-1.5 font-normal"
                                    >
                                      {idea.category === 'SOFTWARE' ? (
                                        <Code2 className="h-2.5 w-2.5 mr-0.5" />
                                      ) : (
                                        <Wrench className="h-2.5 w-2.5 mr-0.5" />
                                      )}
                                      {IDEA_CATEGORY_LABEL[idea.category]}
                                    </Badge>
                                    <span
                                      className={`text-[9px] h-4 px-1.5 rounded border inline-flex items-center font-medium ${
                                        IDEA_STATUS_STYLES[idea.status]
                                      }`}
                                    >
                                      {IDEA_STATUS_LABEL[idea.status]}
                                    </span>
                                  </div>
                                </div>

                                {idea.summary && (
                                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                                    {idea.summary}
                                  </p>
                                )}

                                <div className="flex items-center gap-3 flex-wrap pl-5 text-[10px] text-muted-foreground">
                                  {idea.priceRange && (
                                    <span className="flex items-center gap-1 font-mono font-medium text-foreground">
                                      <DollarSign className="h-2.5 w-2.5" />
                                      {idea.priceRange}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Wrench className="h-2.5 w-2.5" />
                                    {IDEA_EFFORT_LABEL[idea.effort]}
                                  </span>
                                  {idea.techStack.length > 0 && (
                                    <span className="flex items-center gap-1 truncate">
                                      <Code2 className="h-2.5 w-2.5 shrink-0" />
                                      <span className="truncate">
                                        {idea.techStack.slice(0, 3).join(' • ')}
                                        {idea.techStack.length > 3 && ` +${idea.techStack.length - 3}`}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="px-3 pb-3 pt-1 space-y-3 border-t border-border bg-muted/10">
                                  {idea.features.length > 0 && (
                                    <div>
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                                        What you build & offer
                                      </span>
                                      <ul className="space-y-1">
                                        {idea.features.map((feat, idx) => (
                                          <li
                                            key={idx}
                                            className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-relaxed"
                                          >
                                            <span className="h-1 w-1 rounded-full bg-primary/70 mt-1.5 shrink-0" />
                                            <span>{feat}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {idea.techStack.length > 0 && (
                                    <div>
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                                        Suggested Stack
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {idea.techStack.map((tech) => (
                                          <span
                                            key={tech}
                                            className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-card text-muted-foreground font-mono"
                                          >
                                            {tech}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {idea.notes && (
                                    <div className="p-2.5 rounded border border-border bg-card">
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                                        Strategy Notes
                                      </span>
                                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        {idea.notes}
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex justify-end pt-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteIdea(idea.id)
                                      }}
                                      className="text-[10px] text-muted-foreground hover:text-destructive transition flex items-center gap-1"
                                    >
                                      <Trash2 className="h-3 w-3" /> Remove idea
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* New Industry Dialog */}
      <Dialog open={industryDialogOpen} onOpenChange={setIndustryDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold normal-case tracking-normal">
                  New Industry Vertical
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Add a niche worth targeting and the problems you can solve in it.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateIndustry} className="space-y-5 pt-1">
            <div className="space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                The Niche
              </span>

              <div>
                <label className="text-xs font-medium">Industry Name *</label>
                <Input
                  placeholder="e.g. Pet Grooming & Vets"
                  value={newIndustryName}
                  onChange={(e) => setNewIndustryName(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium">Pick an Icon</label>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {EMOJI_PICKS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewIndustryEmoji(emoji)}
                      className={`h-8 w-8 rounded border text-base transition ${
                        newIndustryEmoji === emoji
                          ? 'border-foreground bg-muted'
                          : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">One-line Tagline</label>
                <Input
                  placeholder="Who they are and what is broken for them"
                  value={newIndustryTagline}
                  onChange={(e) => setNewIndustryTagline(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Discovery
              </span>

              <div>
                <label className="text-xs font-medium">Pain Points (one per line)</label>
                <Textarea
                  placeholder={'Bookings handled over DMs\nNo-shows with no reminders'}
                  value={newIndustryPains}
                  onChange={(e) => setNewIndustryPains(e.target.value)}
                  className="text-xs mt-1 min-h-[70px]"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Opportunities (one per line)</label>
                <Textarea
                  placeholder={'Recurring monthly revenue\nOwner-operators buy time-savers'}
                  value={newIndustryOpps}
                  onChange={(e) => setNewIndustryOpps(e.target.value)}
                  className="text-xs mt-1 min-h-[70px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIndustryDialogOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingIndustry} className="text-xs h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {submittingIndustry ? 'Saving...' : 'Add Industry'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Idea Dialog */}
      <Dialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold normal-case tracking-normal">
                  New Offering Idea
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {ideaTargetIndustry
                    ? `A software product or service for ${ideaTargetIndustry.name}.`
                    : 'Capture a product or service idea.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateIdea} className="space-y-5 pt-1">
            <div className="space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                The Idea
              </span>

              <div>
                <label className="text-xs font-medium">Title *</label>
                <Input
                  placeholder="e.g. Booking & No-Show Protection Suite"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Category</label>
                  <Select
                    value={ideaCategory}
                    onValueChange={(v) => v && setIdeaCategory(v as IdeaCategory)}
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
                <div>
                  <label className="text-xs font-medium">Status</label>
                  <Select
                    value={ideaStatus}
                    onValueChange={(v) => v && setIdeaStatus(v as IdeaStatus)}
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
              </div>

              <div>
                <label className="text-xs font-medium">Summary</label>
                <Textarea
                  placeholder="What it does and why the industry will pay for it..."
                  value={ideaSummary}
                  onChange={(e) => setIdeaSummary(e.target.value)}
                  className="text-xs mt-1 min-h-[60px]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Details
              </span>

              <div>
                <label className="text-xs font-medium">Features / Deliverables (one per line)</label>
                <Textarea
                  placeholder={'Online booking with deposits\nAutomated SMS reminders'}
                  value={ideaFeatures}
                  onChange={(e) => setIdeaFeatures(e.target.value)}
                  className="text-xs mt-1 min-h-[70px]"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Tech Stack (comma separated)</label>
                <Input
                  placeholder="Next.js, Prisma, Stripe"
                  value={ideaTechStack}
                  onChange={(e) => setIdeaTechStack(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Price Range</label>
                  <Input
                    placeholder="$49–$149 / month"
                    value={ideaPriceRange}
                    onChange={(e) => setIdeaPriceRange(e.target.value)}
                    className="h-9 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Effort</label>
                  <Select
                    value={ideaEffort}
                    onValueChange={(v) => v && setIdeaEffort(v as IdeaEffort)}
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
                <label className="text-xs font-medium">Strategy Notes</label>
                <Textarea
                  placeholder="Go-to-market angle, risks, why now..."
                  value={ideaNotes}
                  onChange={(e) => setIdeaNotes(e.target.value)}
                  className="text-xs mt-1 min-h-[60px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIdeaDialogOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingIdea} className="text-xs h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {submittingIdea ? 'Saving...' : 'Add Idea'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating hint when filters hide everything */}
      {hasActiveFilter && filteredIndustries.length > 0 && (
        <div className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <X className="h-3 w-3" />
          Showing {filteredIndustries.reduce((acc, f) => acc + f.ideas.length, 0)} matching ideas
          across {filteredIndustries.length} industries
        </div>
      )}
    </div>
  )
}
