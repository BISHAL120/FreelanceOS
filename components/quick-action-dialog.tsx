"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Users, FolderKanban, CheckSquare, FileText, Target, Plus } from 'lucide-react'

interface QuickActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialType?: 'client' | 'project' | 'lead' | 'task' | 'invoice'
  onSuccess?: () => void
}

export function QuickActionDialog({
  open,
  onOpenChange,
  initialType = 'task',
  onSuccess,
}: QuickActionDialogProps) {
  const [type, setType] = useState<'client' | 'project' | 'lead' | 'task' | 'invoice'>(initialType)
  const [loading, setLoading] = useState(false)

  // Forms state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dealValue, setDealValue] = useState('5000')
  const [budget, setBudget] = useState('3500')
  const [priority, setPriority] = useState('MEDIUM')
  const [rate, setRate] = useState('120')

  const resetForm = () => {
    setName('')
    setEmail('')
    setCompany('')
    setTitle('')
    setDescription('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (type === 'client') {
        await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            companyName: company,
            email,
            defaultRate: parseFloat(rate) || 120,
            budget: parseFloat(budget) || 0,
            notes: description,
          }),
        })
      } else if (type === 'lead') {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            company,
            email,
            dealValue: parseFloat(dealValue) || 0,
            notes: description,
            stage: 'NEW',
          }),
        })
      } else if (type === 'project') {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            budget: parseFloat(budget) || 0,
            status: 'PLANNING',
          }),
        })
      } else if (type === 'task') {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            priority,
            status: 'TODO',
          }),
        })
      } else if (type === 'invoice') {
        await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: description || 'Payment terms: net 14 days',
            items: [{ description: title || 'Freelance Sprint Deliverable', quantity: 1, unitPrice: parseFloat(budget) || 2000, amount: parseFloat(budget) || 2000 }],
            status: 'DRAFT',
          }),
        })
      }

      resetForm()
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[520px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Quick Create
          </DialogTitle>
          <DialogDescription className="text-xs">
            Instantly add records to your freelance workspace.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="grid grid-cols-5 gap-0.5 sm:gap-1 p-1 bg-muted rounded-lg text-[10px] sm:text-xs font-medium">
          <button
            type="button"
            onClick={() => setType('task')}
            className={`flex flex-col items-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-md transition ${type === 'task' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" /> Task
          </button>
          <button
            type="button"
            onClick={() => setType('lead')}
            className={`flex flex-col items-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-md transition ${type === 'lead' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" /> Lead
          </button>
          <button
            type="button"
            onClick={() => setType('client')}
            className={`flex flex-col items-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-md transition ${type === 'client' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" /> Client
          </button>
          <button
            type="button"
            onClick={() => setType('project')}
            className={`flex flex-col items-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-md transition ${type === 'project' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FolderKanban className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" /> Project
          </button>
          <button
            type="button"
            onClick={() => setType('invoice')}
            className={`flex flex-col items-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-md transition ${type === 'invoice' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-0.5 sm:mb-1" /> Invoice
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {type === 'task' && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Task Title *</label>
                <Input
                  required
                  placeholder="e.g. Wireframe the checkout screen"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Estimated Hours</label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="2.5"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description / Notes</label>
                <Textarea
                  placeholder="Requirements or acceptance criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            </>
          )}

          {type === 'lead' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Contact Name *</label>
                  <Input
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Company</label>
                  <Input
                    placeholder="e.g. Horizon Labs"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="alex@horizon.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Estimated Deal Value ($)</label>
                  <Input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Project Need / Notes</label>
                <Textarea
                  placeholder="What are they looking for? Inbound source..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            </>
          )}

          {type === 'client' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Client Name *</label>
                  <Input
                    required
                    placeholder="e.g. Rachel Adams"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                  <Input
                    placeholder="e.g. Nexus Media"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email *</label>
                  <Input
                    required
                    type="email"
                    placeholder="rachel@nexusmedia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Hourly Rate ($)</label>
                  <Input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <Textarea
                  placeholder="Communication preference, retainer scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            </>
          )}

          {type === 'project' && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Project Title *</label>
                <Input
                  required
                  placeholder="e.g. Brand Identity & Next.js Website"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Budget ($)</label>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Initial Status</label>
                  <Select defaultValue="PLANNING">
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Planning" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNING">Planning</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Project Scope & Milestones</label>
                <Textarea
                  placeholder="Summary of deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            </>
          )}

          {type === 'invoice' && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Invoice Deliverable / Title *</label>
                <Input
                  required
                  placeholder="e.g. Milestone 1 - Architecture & Design"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Total Amount ($) *</label>
                <Input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Payment Terms & Notes</label>
                <Textarea
                  placeholder="Net 14, wire instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
