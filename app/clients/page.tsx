"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Client, ClientStatus } from '@/lib/types'
import {
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [address, setAddress] = useState('')
  const [defaultRate, setDefaultRate] = useState('120')
  const [budget, setBudget] = useState('5000')
  const [status, setStatus] = useState<ClientStatus>('ACTIVE')
  const [notes, setNotes] = useState('')

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          companyName,
          email,
          phone,
          website,
          industry,
          address,
          defaultRate: parseFloat(defaultRate) || 120,
          budget: parseFloat(budget) || 0,
          status,
          notes,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setName('')
        setCompanyName('')
        setEmail('')
        setPhone('')
        setWebsite('')
        setIndustry('')
        setAddress('')
        setNotes('')
        fetchClients()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/clients/${deleteTarget.id}`, { method: 'DELETE' })
      fetchClients()
    } catch {
      // ignore
    } finally {
      setDeleteTarget(null)
    }
  }

  const filteredClients = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase())) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
            Clients & Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your client roster, communication details, retainers, and linked projects.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-40 h-9 text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
        {filteredClients.map((client) => (
          <Card key={client.id} className="border border-border hover:shadow-md transition-shadow flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge
                    variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="text-[10px] h-4 font-normal mb-1.5"
                  >
                    {client.status}
                  </Badge>
                  <CardTitle className="text-base font-semibold text-foreground">
                    <Link href={`/clients/${client.id}`} className="hover:underline">
                      {client.companyName || client.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1.5 mt-0.5">
                    <span>Contact: {client.name}</span>
                    {client.industry && <span>• {client.industry}</span>}
                  </CardDescription>
                </div>
                <button
                  onClick={() => setDeleteTarget(client)}
                  className="border border-slate-700 hover:text-destructive transition p-2"
                  title="Remove client"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 flex-1">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium">Hourly Rate</span>
                  <span className="font-semibold text-foreground">${client.defaultRate}/hr</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium">Target Budget</span>
                  <span className="font-semibold text-foreground">${client.budget.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a href={`mailto:${client.email}`} className="truncate hover:underline">
                    {client.email}
                  </a>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate hover:underline flex items-center gap-1"
                    >
                      {client.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{client.address}</span>
                  </div>
                )}
              </div>

              {client.notes && (
                <p className="text-[11px] text-muted-foreground/80 line-clamp-2 italic pt-1 border-t">
                  &ldquo;{client.notes}&rdquo;
                </p>
              )}
            </CardContent>

            <div className="p-4 pt-0 mt-3 flex items-center justify-between gap-2">
              <Link href={`/clients/${client.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs h-8">
                  View Profile & Work
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-125 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add New Client Profile</DialogTitle>
            <DialogDescription>Add a new freelance client to your workspace records.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Contact Person *</label>
                <Input
                  required
                  placeholder="e.g. Rachel Adams"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Company / Business</label>
                <Input
                  placeholder="e.g. Apex Health"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="rachel@apex.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Hourly Rate ($)</label>
                <Input
                  type="number"
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Initial Budget ($)</label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Industry / Vertical</label>
                <Input
                  placeholder="e.g. Fintech, Healthcare, SaaS"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Website</label>
                <Input
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Location / Address</label>
              <Input
                placeholder="City, State, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Client Scope Notes</label>
              <Textarea
                placeholder="Key preferences, payment arrangements, communication cadence..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 resize-none"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Client'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="w-[95vw] sm:max-w-sm p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium text-foreground">
                {deleteTarget?.companyName || deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteClient}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
