"use client"

import React, { useState } from 'react'
import {
  Users,
  Plus,
  ShieldCheck,
  Briefcase,
  Code2,
  Mail,
  DollarSign,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/components/auth-context'
import type { UserRole, User } from '@/lib/types'

export default function TeamPage() {
  const { currentUser, users, switchUser, refreshUsers, isAdmin } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('DEVELOPER')
  const [title, setTitle] = useState('')
  const [hourlyRate, setHourlyRate] = useState('85')

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          title,
          hourlyRate: parseFloat(hourlyRate) || 0,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setName('')
        setEmail('')
        setTitle('')
        await refreshUsers()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="h-4 w-4 text-purple-600" />
      case 'LEAD_GEN':
        return <Briefcase className="h-4 w-4 text-emerald-600" />
      case 'DEVELOPER':
        return <Code2 className="h-4 w-4 text-blue-600" />
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">Admin / Owner</Badge>
      case 'LEAD_GEN':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Lead Gen Specialist</Badge>
      case 'DEVELOPER':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">Developer</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
              Team & Role-Based Access (RBAC)
            </h1>
            <Badge variant="outline" className="text-xs">
              {users.length} Active Members
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your small agency team, assign roles (Lead Generation, Developers, Admins), and control workspace visibility.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> Add Team Member
          </Button>
        )}
      </div>

      {/* RBAC Permission Matrix Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-purple-500/5 border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-sm text-foreground">Admin / Owner</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Full agency control. Financial velocity charts, all invoices & billing, all clients, project assignment, and team management.
          </p>
        </Card>

        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-sm text-foreground">Lead Generation Expert</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tailored sales workspace. Log outreach messages, client replies, upload screenshots, schedule follow-ups, and convert leads.
          </p>
        </Card>

        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-sm text-foreground">Developer Teammate</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Focused sprint view. Only sees assigned projects and tasks. Logs work start/completion timestamps and resolves QA defect tickets.
          </p>
        </Card>
      </div>

      {/* Team Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((member) => {
          const isCurrent = member.id === currentUser.id
          return (
            <Card key={member.id} className={`p-4 transition ${isCurrent ? 'border-primary ring-1 ring-primary/20 bg-card' : 'bg-card/70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border">
                    <AvatarImage src={member.avatar || ''} alt={member.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{member.name}</span>
                      {isCurrent && (
                        <Badge variant="outline" className="text-[10px] py-0 border-primary text-primary">
                          You (Active)
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.title || 'Team Member'}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                      <Mail className="h-3 w-3" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {getRoleBadge(member.role)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Rate: <strong className="text-foreground">${member.hourlyRate || 80}/hr</strong></span>
                </div>

                {!isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => switchUser(member.id)}
                  >
                    <span>View as {member.name.split(' ')[0]}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription className="text-xs">
              Invite a lead generation specialist or developer to your agency workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
              <Input
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-8 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Email Address *</label>
              <Input
                type="email"
                placeholder="alex@agency.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-8 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <Select value={role} onValueChange={(v) => v && setRole(v as UserRole)}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEVELOPER" className="text-xs">Developer</SelectItem>
                    <SelectItem value="LEAD_GEN" className="text-xs">Lead Gen Specialist</SelectItem>
                    <SelectItem value="ADMIN" className="text-xs">Admin / Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Hourly Rate ($)</label>
                <Input
                  type="number"
                  placeholder="85"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Job Title / Specialty</label>
              <Input
                placeholder="e.g. Frontend Engineer, B2B Outbound Expert"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="text-xs">
                {submitting ? 'Adding...' : 'Add Team Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
