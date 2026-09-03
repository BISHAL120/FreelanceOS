"use client"

import React, { useEffect, useState } from 'react'
import {
  FileText,
  Plus,
  DollarSign,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Download,
  ExternalLink,
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
import type { Invoice, InvoiceItem, InvoiceStatus, Client, Project } from '@/lib/types'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Creator Modal
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Preview Modal
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)

  // Creator form states
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  )
  const [status, setStatus] = useState<InvoiceStatus>('DRAFT')
  const [notes, setNotes] = useState('Payment due within 14 business days.')
  const [taxRate, setTaxRate] = useState('0')
  const [discount, setDiscount] = useState('0')
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Sprint Deliverable - Web Application Development', quantity: 20, unitPrice: 120, amount: 2400 },
  ])

  const fetchData = async () => {
    try {
      const [iRes, cRes, pRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/clients'),
        fetch('/api/projects'),
      ])
      if (iRes.ok) setInvoices(await iRes.json())
      if (cRes.ok) {
        const cData = await cRes.json()
        setClients(cData)
        if (cData.length > 0 && !clientId) setClientId(cData[0].id)
      }
      if (pRes.ok) setProjects(await pRes.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addItemRow = () => {
    setItems([
      ...items,
      { id: `${Date.now()}`, description: '', quantity: 1, unitPrice: 120, amount: 120 },
    ])
  }

  const updateItemRow = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity
          const price = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice
          updated.amount = Math.round(qty * price * 100) / 100
        }
        return updated
      })
    )
  }

  const removeItemRow = (id: string) => {
    if (items.length <= 1) return
    setItems(items.filter((item) => item.id !== id))
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          projectId: projectId || null,
          invoiceNumber: invoiceNumber || undefined,
          dueDate: new Date(dueDate).toISOString(),
          status,
          notes,
          taxRate: parseFloat(taxRate) || 0,
          discount: parseFloat(discount) || 0,
          items,
        }),
      })
      if (res.ok) {
        setCreateDialogOpen(false)
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const markAsPaid = async (id: string) => {
    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      })
      fetchData()
    } catch {
      // ignore
    }
  }

  const deleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      fetchData()
    } catch {
      // ignore
    }
  }

  const subtotal = items.reduce((acc, item) => acc + item.amount, 0)
  const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100
  const total = Math.max(0, subtotal + taxAmount - (parseFloat(discount) || 0))

  const totalCollected = invoices.filter((i) => i.status === 'PAID').reduce((acc, i) => acc + i.total, 0)
  const totalPending = invoices.filter((i) => i.status === 'SENT').reduce((acc, i) => acc + i.total, 0)
  const totalDraft = invoices.filter((i) => i.status === 'DRAFT').reduce((acc, i) => acc + i.total, 0)

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'ALL') return true
    return inv.status === statusFilter
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
            Invoicing & Billing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create professional freelancer invoices, track remittances, and get paid on time.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
        <Card className="bg-card/70">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Paid & Collected</p>
              <h2 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-emerald-600 truncate">${totalCollected.toLocaleString()}</h2>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Sent / Pending</p>
              <h2 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-amber-500 truncate">${totalPending.toLocaleString()}</h2>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/70">
          <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Draft Balance</p>
              <h2 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 text-foreground truncate">${totalDraft.toLocaleString()}</h2>
            </div>
            <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'PAID', 'SENT', 'DRAFT'].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="text-xs h-8 capitalize"
          >
            {s.toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center text-xs text-muted-foreground">
            No invoices found in this view.
          </Card>
        ) : (
          filteredInvoices.map((inv) => (
            <Card key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xs transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-foreground">{inv.invoiceNumber}</span>
                  <Badge
                    variant={
                      inv.status === 'PAID'
                        ? 'default'
                        : inv.status === 'SENT'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-[10px] h-4 font-normal"
                  >
                    {inv.status}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {inv.clientName} {inv.projectTitle && <span className="font-normal text-muted-foreground">• {inv.projectTitle}</span>}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Issued: {new Date(inv.issueDate).toLocaleDateString()}</span>
                  <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-2 sm:pt-0">
                <div className="text-right">
                  <span className="font-mono text-lg font-bold text-foreground">
                    ${inv.total.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    {inv.status === 'PAID' ? 'Settled' : 'Unpaid balance'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {inv.status !== 'PAID' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsPaid(inv.id)}
                      className="h-8 text-xs text-emerald-600 hover:bg-emerald-500/10"
                    >
                      Mark Paid
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setPreviewInvoice(inv)
                      setPreviewDialogOpen(true)
                    }}
                    className="h-8 text-xs gap-1"
                  >
                    <Printer className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <button
                    onClick={() => deleteInvoice(inv.id)}
                    className="text-muted-foreground/40 hover:text-destructive transition p-1"
                    title="Delete invoice"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Invoice Generator Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Generate Freelancer Invoice</DialogTitle>
            <DialogDescription className="text-xs">Add itemized billable sprint work, tax, and remit terms.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Client *</label>
                <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
                  <SelectTrigger className="mt-1">
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
                <label className="text-xs font-medium text-muted-foreground">Linked Project</label>
                <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Project (Optional)" />
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Invoice # (Auto)</label>
                <Input
                  placeholder="e.g. INV-2026-004"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={status} onValueChange={(v) => v && setStatus(v as InvoiceStatus)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Line Items</span>
                <Button type="button" variant="outline" size="sm" onClick={addItemRow} className="h-7 text-xs">
                  + Add Item
                </Button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border bg-muted/20 space-y-2 sm:space-y-0 sm:border-0 sm:bg-transparent sm:p-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center text-xs"
                >
                  <div className="sm:col-span-6">
                    <Input
                      placeholder="Item description / deliverable"
                      value={item.description}
                      onChange={(e) => updateItemRow(item.id, 'description', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center sm:contents">
                    <div className="sm:col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty/Hrs"
                        value={item.quantity}
                        onChange={(e) => updateItemRow(item.id, 'quantity', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        type="number"
                        placeholder="Rate ($)"
                        value={item.unitPrice}
                        onChange={(e) => updateItemRow(item.id, 'unitPrice', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between sm:contents">
                      <div className="sm:col-span-1 font-mono font-semibold text-right">
                        ${item.amount}
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removeItemRow(item.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Summary */}
            <div className="p-3 rounded-lg bg-muted/40 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-mono font-semibold">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground">Tax Rate (%):</span>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-20 h-7 text-right text-xs"
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground">Discount ($):</span>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 h-7 text-right text-xs"
                />
              </div>
              <div className="flex justify-between pt-2 border-t text-sm font-bold">
                <span>Total Amount Due:</span>
                <span className="font-mono text-emerald-600">${total.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Notes & Payment Instructions</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 resize-none text-xs"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Save & Issue Invoice'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Printable Preview Modal */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          {previewInvoice && (
            <div className="p-4 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading tracking-tight text-foreground">Freelance Studio</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Software Engineering & Product Design</p>
                  <p className="text-xs text-muted-foreground">billing@freelance.studio</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-foreground">{previewInvoice.invoiceNumber}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Date: {new Date(previewInvoice.issueDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: <strong>{new Date(previewInvoice.dueDate).toLocaleDateString()}</strong>
                  </p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] block mb-1">
                    Billed To:
                  </span>
                  <p className="font-bold text-foreground text-sm">{previewInvoice.clientName}</p>
                </div>
                {previewInvoice.projectTitle && (
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] block mb-1">
                      Deliverable Project:
                    </span>
                    <p className="font-medium text-foreground">{previewInvoice.projectTitle}</p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Qty / Hrs</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-foreground">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">${item.unitPrice}</td>
                        <td className="p-3 text-right font-mono font-semibold">${item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Box */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-mono font-semibold">${previewInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {previewInvoice.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({previewInvoice.taxRate}%):</span>
                      <span className="font-mono">${previewInvoice.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {previewInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="font-mono">-${previewInvoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-bold text-base">
                    <span>Total:</span>
                    <span className="font-mono text-emerald-600">${previewInvoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              {previewInvoice.notes && (
                <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
                  <strong className="text-foreground block mb-1">Notes / Remittance Terms:</strong>
                  {previewInvoice.notes}
                </div>
              )}

              {/* Print / Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
                  <Printer className="h-4 w-4" /> Print / Save PDF
                </Button>
                <Button size="sm" onClick={() => setPreviewDialogOpen(false)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
