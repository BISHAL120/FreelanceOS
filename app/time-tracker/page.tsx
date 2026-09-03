"use client"

import React, { useEffect, useState } from 'react'
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Calendar,
  FolderKanban,
  Users,
  Trash2,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTimer } from '@/components/timer-context'
import type { TimeEntry, Project, Client } from '@/lib/types'

export default function TimeTrackerPage() {
  const {
    isRunning,
    seconds,
    description,
    selectedClientId,
    selectedProjectId,
    clients,
    projects,
    setDescription,
    setSelectedClientId,
    setSelectedProjectId,
    startTimer,
    pauseTimer,
    resetTimer,
    saveTimeEntry,
    refreshClientsAndProjects,
  } = useTimer()

  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Manual entry modal / state
  const [manualMinutes, setManualMinutes] = useState('60')
  const [manualDesc, setManualDesc] = useState('')
  const [manualProj, setManualProj] = useState('')

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/time-entries')
      if (res.ok) {
        setEntries(await res.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
    refreshClientsAndProjects()
  }, [])

  const handleSaveActiveTimer = async () => {
    setSaving(true)
    const ok = await saveTimeEntry()
    if (ok) {
      fetchEntries()
    } else {
      alert('Please track at least 10 seconds before saving.')
    }
    setSaving(false)
  }

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: manualDesc || 'Freelance work',
          durationMinutes: parseInt(manualMinutes) || 60,
          projectId: manualProj || null,
          billable: true,
        }),
      })
      if (res.ok) {
        setManualDesc('')
        setManualMinutes('60')
        fetchEntries()
      }
    } catch {
      // ignore
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      await fetch(`/api/time-entries/${id}`, { method: 'DELETE' })
      fetchEntries()
    } catch {
      // ignore
    }
  }

  const formatLargeTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const totalMinutes = entries.reduce((acc, e) => acc + e.durationMinutes, 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10
  const totalEarned = entries.reduce((acc, e) => acc + (e.durationMinutes / 60) * e.hourlyRate, 0)

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
          Time Tracker & Timesheets
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record billable client hours live or enter work logs manually to convert into invoices.
        </p>
      </div>

      {/* Main Stopwatch Widget Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
            {/* Big Stopwatch Display */}
            <div className="flex flex-col items-start w-full lg:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2.5 w-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-muted-foreground/50'}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {isRunning ? 'Timer Active' : 'Timer Ready'}
                </span>
              </div>
              <div className="font-mono text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                {formatLargeTimer(seconds)}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 flex-wrap w-full">
                <Button
                  size="default"
                  onClick={isRunning ? pauseTimer : startTimer}
                  className={`gap-1.5 sm:gap-2 h-9 sm:h-11 px-3 sm:px-6 font-semibold shadow-sm flex-1 sm:flex-initial text-xs sm:text-sm ${isRunning ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 sm:h-5 sm:w-5" /> Start
                    </>
                  )}
                </Button>
                <Button variant="outline" size="default" onClick={resetTimer} className="h-9 sm:h-11 px-3 sm:px-4 text-xs">
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" /> Reset
                </Button>
                <Button
                  variant="secondary"
                  size="default"
                  onClick={handleSaveActiveTimer}
                  disabled={seconds < 10 || saving}
                  className="h-9 sm:h-11 px-3 sm:px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-initial"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                  {saving ? 'Logging...' : 'Log Session'}
                </Button>
              </div>
            </div>

            {/* Session Metadata Controls */}
            <div className="space-y-3 w-full lg:max-w-md bg-muted/40 p-3.5 sm:p-4 rounded-xl border">
              <div>
                <label className="text-xs font-medium text-muted-foreground">What are you working on?</label>
                <Input
                  placeholder="e.g. Header redesign & responsive styling"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Client</label>
                  <Select value={selectedClientId} onValueChange={(v) => v && setSelectedClientId(v)}>
                    <SelectTrigger className="mt-1 text-xs">
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.companyName || c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Project</label>
                  <Select value={selectedProjectId} onValueChange={(v) => v && setSelectedProjectId(v)}>
                    <SelectTrigger className="mt-1 text-xs">
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics Summary */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
        <Card className="bg-card/70">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Total Hours</p>
              <h3 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-foreground truncate">{totalHours.toFixed(1)}h</h3>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Billable Earnings</p>
              <h3 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-emerald-600 truncate">${Math.round(totalEarned).toLocaleString()}</h3>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Sessions</p>
              <h3 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-foreground truncate">{entries.length}</h3>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timesheet Log Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Timesheet Ledger</CardTitle>
            <CardDescription className="text-xs">Detailed records of tracked work sessions</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {entries.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No time entries logged yet.
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border bg-card/60 hover:bg-muted/30 transition gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground text-sm">{entry.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                      {entry.projectTitle && (
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <FolderKanban className="h-3 w-3" /> {entry.projectTitle}
                        </span>
                      )}
                      {entry.clientName && <span>• {entry.clientName}</span>}
                      <span>• {new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {(entry.durationMinutes / 60).toFixed(1)} hrs
                      </span>
                      <p className="text-[11px] text-emerald-600 font-semibold">
                        ${((entry.durationMinutes / 60) * entry.hourlyRate).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-muted-foreground/40 hover:text-destructive transition p-1"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
