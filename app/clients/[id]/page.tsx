"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  DollarSign,
  FolderKanban,
  FileText,
  CheckSquare,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import type { Client } from '@/lib/types'

export default function ClientDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`)
      if (res.ok) {
        const data = await res.json()
        setClient(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchClient()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded-xl"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold">Client Not Found</h2>
        <Link href="/clients" className="mt-4 inline-block text-primary text-sm hover:underline">
          Return to Clients List
        </Link>
      </div>
    )
  }

  const projects = client.projects || []
  const invoices = client.invoices || []
  const tasks = client.tasks || []
  const timeEntries = client.timeEntries || []

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total, 0)
  const totalPaid = invoices.filter((i) => i.status === 'PAID').reduce((acc, inv) => acc + inv.total, 0)
  const totalHoursLogged = Math.round((timeEntries.reduce((acc, te) => acc + te.durationMinutes, 0) / 60) * 10) / 10

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <Link href="/clients" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Clients
      </Link>

      {/* Header Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
                {client.industry && (
                  <Badge variant="outline" className="text-xs">
                    {client.industry}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
                {client.companyName || client.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Primary Contact: <span className="font-medium text-foreground">{client.name}</span>
              </p>
            </div>

            {/* Quick Financial Highlight */}
            <div className="flex items-center gap-4 bg-muted/40 p-3 rounded-xl border text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium">Hourly Rate</span>
                <span className="text-base font-bold text-foreground">${client.defaultRate}/hr</span>
              </div>
              <div className="border-l pl-4">
                <span className="text-[10px] text-muted-foreground block font-medium">Total Paid</span>
                <span className="text-base font-bold text-emerald-600">${totalPaid.toLocaleString()}</span>
              </div>
              <div className="border-l pl-4">
                <span className="text-[10px] text-muted-foreground block font-medium">Logged Time</span>
                <span className="text-base font-bold text-foreground">{totalHoursLogged} hrs</span>
              </div>
            </div>
          </div>

          {/* Contact Details Bar */}
          <div className="mt-6 pt-4 border-t flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="hover:underline text-foreground">
                {client.email}
              </a>
            </div>
            {client.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <a href={client.website} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-foreground">
                  {client.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{client.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Workspace */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="time">Time Logs</TabsTrigger>
        </TabsList>

        {/* PROJECTS TAB */}
        <TabsContent value="projects" className="mt-4 space-y-4">
          {projects.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No projects created for this client yet.
            </Card>
          ) : (
            projects.map((proj) => (
              <Card key={proj.id} className="p-4 hover:shadow-xs transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{proj.title}</h3>
                    {proj.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{proj.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs font-normal">
                    {proj.status}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-semibold text-foreground">{proj.progress}%</span>
                  </div>
                  <Progress value={proj.progress} className="h-2" />
                </div>
                <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>Budget: <strong className="text-foreground">${proj.budget.toLocaleString()}</strong></span>
                  <span>Spent: <strong className="text-foreground">${proj.spent.toLocaleString()}</strong></span>
                  <span className="text-emerald-600 font-medium">
                    Remaining: ${(proj.budget - proj.spent).toLocaleString()}
                  </span>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices" className="mt-4 space-y-3">
          {invoices.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No invoices generated for this client yet.
            </Card>
          ) : (
            invoices.map((inv) => (
              <Card key={inv.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-xs text-foreground">{inv.invoiceNumber}</span>
                    <Badge
                      variant={inv.status === 'PAID' ? 'default' : 'secondary'}
                      className="text-[10px] h-4 font-normal"
                    >
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {new Date(inv.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-foreground">${inv.total.toLocaleString()}</span>
                  <p className="text-[10px] text-muted-foreground">
                    {inv.status === 'PAID' ? 'Settled' : 'Pending payment'}
                  </p>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* TASKS TAB */}
        <TabsContent value="tasks" className="mt-4 space-y-3">
          {tasks.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No tasks currently assigned to this client.
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className={`h-4 w-4 ${task.status === 'DONE' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className={`text-xs font-medium ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Priority: {task.priority}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  {task.status}
                </Badge>
              </Card>
            ))
          )}
        </TabsContent>

        {/* TIME LOGS TAB */}
        <TabsContent value="time" className="mt-4 space-y-3">
          {timeEntries.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No time logs recorded for this client yet.
            </Card>
          ) : (
            timeEntries.map((te) => (
              <Card key={te.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-foreground">{te.description}</p>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(te.date).toLocaleDateString()} • ${te.hourlyRate}/hr
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-foreground">
                    {(te.durationMinutes / 60).toFixed(1)} hrs
                  </span>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    ${((te.durationMinutes / 60) * te.hourlyRate).toFixed(2)}
                  </p>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
