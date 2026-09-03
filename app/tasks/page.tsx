"use client"

import React, { useEffect, useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  FolderKanban,
  CheckCircle2,
  Trash2,
  Play,
  User as UserIcon,
  X,
  Kanban,
  Table as TableIcon,
  ArrowRight,
  ArrowLeft,
  GripVertical,
  Check,
  Edit2,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { useAuth } from '@/components/auth-context'
import type { Task, TaskStatus, TaskPriority, Project, Client, User } from '@/lib/types'

export const TASK_COLUMNS: {
  status: TaskStatus
  label: string
  description: string
}[] = [
  { status: 'TODO', label: 'To Do', description: 'Queued sprint items' },
  { status: 'IN_PROGRESS', label: 'In Progress', description: 'Currently active work' },
  { status: 'REVIEW', label: 'In Review', description: 'QA & peer testing' },
  { status: 'DONE', label: 'Completed', description: 'Delivered & accepted' },
]

function TaskCardPreview({ task, targetIndex }: { task: Task; targetIndex: number }) {
  const isOverdue =
    task.dueDate &&
    task.status !== 'DONE' &&
    new Date(task.dueDate).getTime() < Date.now()

  return (
    <div
      data-kanban-preview="true"
      className="p-3 rounded-md border-2 border-dashed border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-2 ring-primary/20 space-y-2 transition-all duration-150 relative overflow-hidden pointer-events-none select-none animate-in fade-in-50 zoom-in-95"
    >
      {/* Top Banner: Drop slot & target serial position */}
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

      {/* Card Top: Priority Badge & Project Tag */}
      <div className="flex items-center justify-between gap-1 text-[10px]">
        <div className="flex items-center gap-1.5 truncate">
          <Badge
            variant={
              task.priority === 'URGENT'
                ? 'destructive'
                : task.priority === 'HIGH'
                ? 'default'
                : 'secondary'
            }
            className="text-[9px] h-4 px-1.5 font-normal tracking-wide"
          >
            {task.priority}
          </Badge>

          {task.projectTitle && (
            <span className="text-muted-foreground truncate max-w-[130px] font-medium flex items-center gap-0.5">
              <FolderKanban className="h-2.5 w-2.5 shrink-0 text-primary" />
              <span className="truncate">{task.projectTitle}</span>
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-primary/80 font-semibold">#{targetIndex + 1}</span>
      </div>

      {/* Task Title */}
      <h3 className="text-xs font-semibold leading-snug line-clamp-2 text-foreground">
        {task.title}
      </h3>

      {/* Task Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Metadata: Assignee & Hours */}
      <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground pt-1 border-t border-primary/20">
        <div className="flex items-center gap-1 truncate">
          <span className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-semibold uppercase">
            {task.assignedToName ? task.assignedToName.charAt(0) : '?'}
          </span>
          <span className="truncate max-w-[90px] font-medium text-foreground">
            {task.assignedToName || 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono shrink-0">
          {task.estimatedHours > 0 && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5 text-primary" /> {task.estimatedHours}h
            </span>
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-0.5 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
              <Calendar className="h-2.5 w-2.5" />
              {new Date(task.dueDate).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Bottom release hint */}
      <div className="text-[9px] font-mono text-primary/80 italic text-center pt-0.5">
        Release to insert at Position #{targetIndex + 1}
      </div>
    </div>
  )
}

function TaskCardFaded({ task, index }: { task: Task; index: number }) {
  return (
    <div
      data-kanban-faded="true"
      className="p-3 rounded-md border-2 border-dashed border-primary/40 bg-muted/30 opacity-40 grayscale-[25%] scale-[0.98] transition-all space-y-2 relative pointer-events-none select-none"
    >
      {/* Origin Banner */}
      <div className="flex items-center justify-between pb-1 border-b border-border/40 text-[9px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5 italic font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse" />
          Original position (Moving...)
        </span>
        <span className="text-[9px] font-mono opacity-70">#{index + 1}</span>
      </div>

      {/* Card Top: Priority Badge & Project Tag */}
      <div className="flex items-center justify-between gap-1 text-[10px]">
        <div className="flex items-center gap-1.5 truncate">
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-normal tracking-wide opacity-70">
            {task.priority}
          </Badge>
          {task.projectTitle && (
            <span className="text-muted-foreground truncate max-w-[130px] font-medium flex items-center gap-0.5 opacity-70">
              <FolderKanban className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{task.projectTitle}</span>
            </span>
          )}
        </div>
        <GripVertical className="h-3 w-3 text-muted-foreground/30 shrink-0" />
      </div>

      {/* Task Title */}
      <h3 className="text-xs font-medium leading-snug line-clamp-2 text-muted-foreground">
        {task.title}
      </h3>

      {/* Task Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground/60 pt-1 border-t border-border/40">
        <span className="truncate max-w-[90px]">{task.assignedToName || 'Unassigned'}</span>
        {task.estimatedHours > 0 && (
          <span className="font-mono text-[10px]">{task.estimatedHours}h</span>
        )}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  index,
  onDragStart,
  onDragEnd,
  onClick,
  onShiftPrev,
  onShiftNext,
  onStart,
  onComplete,
}: {
  task: Task
  index: number
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onClick: () => void
  onShiftPrev: () => void
  onShiftNext: () => void
  onStart: () => void
  onComplete: () => void
}) {
  const isOverdue =
    task.dueDate &&
    task.status !== 'DONE' &&
    new Date(task.dueDate).getTime() < Date.now()

  return (
    <div
      data-kanban-card="true"
      data-task-id={task.id}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`p-3 rounded-md border bg-card hover:border-foreground/30 hover:shadow-xs transition cursor-grab active:cursor-grabbing space-y-2 group ${
        task.priority === 'URGENT' ? 'border-destructive/40' : 'border-border'
      }`}
    >
      {/* Card Top: Priority Badge & Project Tag */}
      <div className="flex items-center justify-between gap-1 text-[10px]">
        <div className="flex items-center gap-1.5 truncate">
          <Badge
            variant={
              task.priority === 'URGENT'
                ? 'destructive'
                : task.priority === 'HIGH'
                ? 'default'
                : 'secondary'
            }
            className="text-[9px] h-4 px-1.5 font-normal tracking-wide"
          >
            {task.priority}
          </Badge>

          {task.projectTitle && (
            <span className="text-muted-foreground truncate max-w-[120px] font-medium flex items-center gap-0.5">
              <FolderKanban className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{task.projectTitle}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono text-muted-foreground/50 font-semibold group-hover:text-muted-foreground">
            #{index + 1}
          </span>
          <GripVertical className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 cursor-grab" />
        </div>
      </div>

      {/* Task Title */}
      <h3
        className={`text-xs font-medium leading-snug line-clamp-2 ${
          task.status === 'DONE'
            ? 'line-through text-muted-foreground'
            : 'text-foreground'
        }`}
      >
        {task.title}
      </h3>

      {/* Task Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Metadata: Assignee & Hours */}
      <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
        <div className="flex items-center gap-1 truncate">
          <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-foreground uppercase">
            {task.assignedToName ? task.assignedToName.charAt(0) : '?'}
          </span>
          <span className="truncate max-w-[90px]">
            {task.assignedToName || 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono shrink-0">
          {task.estimatedHours > 0 && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" /> {task.estimatedHours}h
            </span>
          )}
          {task.dueDate && (
            <span
              className={`flex items-center gap-0.5 ${
                isOverdue ? 'text-destructive font-medium' : ''
              }`}
            >
              <Calendar className="h-2.5 w-2.5" />
              {new Date(task.dueDate).toLocaleDateString([], {
                month: 'numeric',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Quick Card Controls: Bump arrows & Quick Start/Done */}
      <div
        className="pt-1.5 flex items-center justify-between text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={onShiftPrev}
            disabled={task.status === 'TODO'}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition"
            title="Move left"
          >
            <ArrowLeft className="h-3 w-3" />
          </button>
          <button
            onClick={onShiftNext}
            disabled={task.status === 'DONE'}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition"
            title="Move right"
          >
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {task.status === 'TODO' && (
            <button
              onClick={onStart}
              className="text-[10px] text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-0.5"
            >
              <Play className="h-2.5 w-2.5" /> Start
            </button>
          )}
          {task.status !== 'DONE' ? (
            <button
              onClick={onComplete}
              className="text-[10px] text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-0.5"
            >
              <Check className="h-2.5 w-2.5" /> Mark Done
            </button>
          ) : (
            <span className="text-[10px] text-muted-foreground font-medium">
              Done ✓
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { currentUser, users, isAdmin, isDeveloper } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  // View mode
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL')

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const draggedTask = useMemo(
    () => tasks.find((t) => t.id === draggedTaskId) || null,
    [tasks, draggedTaskId]
  )

  // New Task modal
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [estimatedHours, setEstimatedHours] = useState('2')
  const [projectId, setProjectId] = useState<string>('')
  const [assignedToId, setAssignedToId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')

  // Task Detail / Edit modal
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [updatingTask, setUpdatingTask] = useState(false)

  const fetchData = async () => {
    try {
      const [tRes, pRes, cRes] = await Promise.all([
        fetch(`/api/tasks?userId=${currentUser.id}&role=${currentUser.role}`),
        fetch(`/api/projects?userId=${currentUser.id}&role=${currentUser.role}`),
        fetch('/api/clients'),
      ])
      if (tRes.ok) setTasks(await tRes.json())
      if (pRes.ok) setProjects(await pRes.json())
      if (cRes.ok) setClients(await cRes.json())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentUser.id, currentUser.role])

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const assignee = users.find((u) => u.id === assignedToId)
      const selectedProj = projects.find((p) => p.id === projectId)
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          status,
          estimatedHours: parseFloat(estimatedHours) || 0,
          projectId: projectId || null,
          projectTitle: selectedProj?.title || null,
          assignedToId: assignedToId || currentUser.id,
          assignedToName: assignee?.name || currentUser.name,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setTitle('')
        setDescription('')
        setAssignedToId('')
        setProjectId('')
        setDueDate('')
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  // Update Task Status (Button or Quick shift)
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic local update
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId)
      if (!task) return prev
      const remaining = prev.filter((t) => t.id !== taskId)
      const targetCol = remaining
        .filter((t) => t.status === newStatus)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const updatedTask: Task = {
        ...task,
        status: newStatus,
        order: targetCol.length,
      }
      targetCol.push(updatedTask)
      targetCol.forEach((t, i) => {
        t.order = i
      })
      const otherCols = remaining.filter((t) => t.status !== newStatus)
      return [...otherCols, ...targetCol].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    })

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          action: newStatus === 'DONE' ? 'complete' : newStatus === 'IN_PROGRESS' ? 'start' : undefined,
        }),
      })
      fetchData()
    } catch {
      // Revert if error
      fetchData()
    }
  }

  // Shift Stage Forward / Backward
  const shiftStage = (task: Task, direction: 'next' | 'prev') => {
    const currentIndex = TASK_COLUMNS.findIndex((c) => c.status === task.status)
    if (currentIndex === -1) return
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex >= 0 && newIndex < TASK_COLUMNS.length) {
      updateTaskStatus(task.id, TASK_COLUMNS[newIndex].status)
    }
  }

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
    // Delay state change by requestAnimationFrame so browser captures a crisp drag snapshot
    requestAnimationFrame(() => {
      setDraggedTaskId(taskId)
    })
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDragOverColumn(null)
    setDragOverIndex(null)
  }

  const handleContainerDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (dragOverColumn !== status) {
      setDragOverColumn(status)
    }

    const container = e.currentTarget as HTMLElement
    // Query all non-faded, non-preview cards in this container
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

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId
    const targetIdx = dragOverIndex !== null ? dragOverIndex : 0

    // Reset visual drag states immediately
    setDraggedTaskId(null)
    setDragOverColumn(null)
    setDragOverIndex(null)

    if (!taskId) return

    // Optimistic local update of tasks
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId)
      if (!task) return prev

      const oldStatus = task.status
      const now = new Date().toISOString()
      let startedAt = task.startedAt
      if (status === 'IN_PROGRESS' && !startedAt) startedAt = now
      let completedAt = task.completedAt
      if (status === 'DONE' && !completedAt) completedAt = now

      const updatedTask: Task = {
        ...task,
        status,
        startedAt,
        completedAt,
        updatedAt: now,
      }

      const remaining = prev.filter((t) => t.id !== taskId)
      const targetTasks = remaining
        .filter((t) => t.status === status)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      const boundedIdx = Math.max(0, Math.min(targetIdx, targetTasks.length))
      targetTasks.splice(boundedIdx, 0, updatedTask)

      targetTasks.forEach((t, i) => {
        t.order = i
      })

      const otherTasks = remaining.filter((t) => t.status !== status)
      if (oldStatus !== status) {
        const oldTasks = otherTasks
          .filter((t) => t.status === oldStatus)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        oldTasks.forEach((t, i) => {
          t.order = i
        })
      }

      return [...otherTasks, ...targetTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    })

    try {
      const res = await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          targetStatus: status,
          targetIndex: targetIdx,
          userId: currentUser.id,
          role: currentUser.role,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.tasks) {
          setTasks(data.tasks)
        }
      }
    } catch {
      fetchData()
    }
  }

  // Quick Start / Complete
  const handleStartTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      })
      fetchData()
    } catch {
      // ignore
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })
      fetchData()
    } catch {
      // ignore
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (detailOpen) setDetailOpen(false)
      fetchData()
    } catch {
      // ignore
    }
  }

  // Save changes from Edit modal
  const handleSaveTaskDetail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return
    setUpdatingTask(true)
    try {
      const assignee = users.find((u) => u.id === editingTask.assignedToId)
      const proj = projects.find((p) => p.id === editingTask.projectId)

      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority,
          status: editingTask.status,
          estimatedHours: editingTask.estimatedHours,
          actualHours: editingTask.actualHours,
          projectId: editingTask.projectId || null,
          projectTitle: proj?.title || null,
          assignedToId: editingTask.assignedToId,
          assignedToName: assignee?.name || editingTask.assignedToName,
          dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString() : null,
        }),
      })

      if (res.ok) {
        setDetailOpen(false)
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setUpdatingTask(false)
    }
  }

  const openAddTaskInColumn = (colStatus: TaskStatus) => {
    setStatus(colStatus)
    setDialogOpen(true)
  }

  const openTaskDetail = (task: Task) => {
    setEditingTask({ ...task })
    setDetailOpen(true)
  }

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.projectTitle && t.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.assignedToName && t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesProject = projectFilter === 'ALL' || t.projectId === projectFilter
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter

      let matchesAssignee = true
      if (assigneeFilter === 'ME') {
        matchesAssignee = t.assignedToId === currentUser.id
      } else if (assigneeFilter !== 'ALL') {
        matchesAssignee = t.assignedToId === assigneeFilter
      }

      return matchesSearch && matchesProject && matchesPriority && matchesAssignee
    })
  }, [tasks, searchQuery, projectFilter, priorityFilter, assigneeFilter, currentUser.id])

  // Metrics
  const totalTasksCount = tasks.length
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const completedCount = tasks.filter((t) => t.status === 'DONE').length
  const totalEstHours = tasks
    .filter((t) => t.status !== 'DONE')
    .reduce((sum, t) => sum + (t.estimatedHours || 0), 0)

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-sans">
            Task Board
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Agile sprint board with drag-and-drop workflow, time logs, and developer task assignment.
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
              <Kanban className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" /> List
            </button>
          </div>

          <Button
            onClick={() => {
              setStatus('TODO')
              setDialogOpen(true)
            }}
            size="sm"
            className="h-8 gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> New Task
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-border bg-card">
          <span className="text-[11px] text-muted-foreground block font-medium">Sprint Backlog</span>
          <div className="text-xl font-semibold mt-0.5 text-foreground font-mono">
            {tasks.filter((t) => t.status === 'TODO').length}
          </div>
          <span className="text-[10px] text-muted-foreground">Tasks waiting to start</span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card">
          <span className="text-[11px] text-muted-foreground block font-medium">In Progress</span>
          <div className="text-xl font-semibold mt-0.5 text-foreground font-mono">
            {inProgressCount}
          </div>
          <span className="text-[10px] text-muted-foreground">Currently being coded</span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card">
          <span className="text-[11px] text-muted-foreground block font-medium">In Review</span>
          <div className="text-xl font-semibold mt-0.5 text-foreground font-mono">
            {tasks.filter((t) => t.status === 'REVIEW').length}
          </div>
          <span className="text-[10px] text-muted-foreground">Pending QA & approval</span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card">
          <span className="text-[11px] text-muted-foreground block font-medium">Remaining Workload</span>
          <div className="text-xl font-semibold mt-0.5 text-foreground font-mono">
            {totalEstHours}h
          </div>
          <span className="text-[10px] text-muted-foreground">{completedCount} tasks completed</span>
        </div>
      </div>

      {/* Search & Productivity Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, project, assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick "My Tasks" Pill */}
          <button
            onClick={() => setAssigneeFilter(assigneeFilter === 'ME' ? 'ALL' : 'ME')}
            className={`h-8 px-2.5 rounded-md text-xs font-medium border transition inline-flex items-center gap-1.5 ${
              assigneeFilter === 'ME'
                ? 'bg-foreground text-background border-foreground'
                : 'border-border bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserIcon className="h-3 w-3" /> My Tasks
          </button>

          {/* Project Filter */}
          <Select value={projectFilter} onValueChange={(v) => v && setProjectFilter(v)}>
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={(v) => v && setPriorityFilter(v)}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Priorities</SelectItem>
              <SelectItem value="URGENT" className="text-xs">Urgent</SelectItem>
              <SelectItem value="HIGH" className="text-xs">High</SelectItem>
              <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
              <SelectItem value="LOW" className="text-xs">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Assignee Filter */}
          <Select value={assigneeFilter} onValueChange={(v) => v && setAssigneeFilter(v)}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Members</SelectItem>
              <SelectItem value="ME" className="text-xs font-medium">Assigned to Me</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id} className="text-xs">
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || projectFilter !== 'ALL' || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setProjectFilter('ALL')
                setPriorityFilter('ALL')
                setAssigneeFilter('ALL')
              }}
              className="h-8 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. KANBAN SPRINT BOARD VIEW                              */}
      {/* ======================================================== */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 items-start min-h-[calc(100vh-320px)]">
          {TASK_COLUMNS.map((col) => {
            const colTasks = filteredTasks
              .filter((t) => t.status === col.status)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            const colEstHours = colTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
            const colActualHours = colTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
            const isDropTarget = dragOverColumn === col.status
            const otherTasks = colTasks.filter((t) => t.id !== draggedTaskId)
            const targetIdx = Math.max(0, Math.min(dragOverIndex ?? 0, otherTasks.length))

            return (
              <div
                key={col.status}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    if (dragOverColumn === col.status) {
                      setDragOverColumn(null)
                      setDragOverIndex(null)
                    }
                  }
                }}
                className={`w-[290px] min-w-[290px] max-w-[290px] shrink-0 flex flex-col rounded-lg border transition-all ${
                  isDropTarget
                    ? 'border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20'
                    : 'border-border bg-muted/20'
                }`}
              >
                {/* Column Header */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    if (dragOverColumn !== col.status) setDragOverColumn(col.status)
                    if (dragOverIndex !== 0) setDragOverIndex(0)
                  }}
                  onDrop={(e) => handleDrop(e, col.status)}
                  className="p-3 border-b border-border bg-card/60 rounded-t-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full transition-colors ${
                      isDropTarget ? 'bg-primary animate-pulse' : 'bg-foreground/60'
                    }`} />
                    <span className="font-medium text-xs text-foreground">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      ({colTasks.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {col.status === 'DONE' ? `${colActualHours}h done` : `${colEstHours}h est`}
                    </span>
                    <button
                      onClick={() => openAddTaskInColumn(col.status)}
                      className="h-5 w-5 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition"
                      title={`Add task to ${col.label}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Droppable Container */}
                <div
                  onDragOver={(e) => handleContainerDragOver(e, col.status)}
                  onDrop={(e) => handleDrop(e, col.status)}
                  className="p-2 space-y-2 flex-1 max-h-[calc(100vh-390px)] overflow-y-auto min-h-[140px]"
                >
                  {isDropTarget && draggedTask ? (
                    otherTasks.length === 0 ? (
                      <TaskCardPreview task={draggedTask} targetIndex={0} />
                    ) : (
                      Array.from({ length: otherTasks.length + 1 }).map((_, slotIdx) => (
                        <React.Fragment key={`slot-${slotIdx}`}>
                          {targetIdx === slotIdx && (
                            <TaskCardPreview task={draggedTask} targetIndex={slotIdx} />
                          )}
                          {slotIdx < otherTasks.length && (
                            <TaskCard
                              task={otherTasks[slotIdx]}
                              index={slotIdx >= targetIdx ? slotIdx + 1 : slotIdx}
                              onDragStart={(e) => handleDragStart(e, otherTasks[slotIdx].id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => openTaskDetail(otherTasks[slotIdx])}
                              onShiftPrev={() => shiftStage(otherTasks[slotIdx], 'prev')}
                              onShiftNext={() => shiftStage(otherTasks[slotIdx], 'next')}
                              onStart={() => handleStartTask(otherTasks[slotIdx].id)}
                              onComplete={() => handleCompleteTask(otherTasks[slotIdx].id)}
                            />
                          )}
                        </React.Fragment>
                      ))
                    )
                  ) : colTasks.length === 0 ? (
                    <div className="h-28 border border-dashed border-border/60 rounded-md flex flex-col items-center justify-center text-center p-3 text-xs text-muted-foreground/60 space-y-1">
                      <span>No tasks in this lane</span>
                      <button
                        onClick={() => openAddTaskInColumn(col.status)}
                        className="text-[10px] text-foreground hover:underline font-medium"
                      >
                        + Create a task
                      </button>
                    </div>
                  ) : (
                    colTasks.map((task, idx) => {
                      if (task.id === draggedTaskId) {
                        return <TaskCardFaded key={task.id} task={task} index={idx} />
                      }
                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={idx}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => openTaskDetail(task)}
                          onShiftPrev={() => shiftStage(task, 'prev')}
                          onShiftNext={() => shiftStage(task, 'next')}
                          onStart={() => handleStartTask(task.id)}
                          onComplete={() => handleCompleteTask(task.id)}
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
      {/* 2. TABLE / LIST VIEW                                     */}
      {/* ======================================================== */}
      {viewMode === 'table' && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="p-3">Task</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assignee</th>
                  <th className="p-3">Est. Time</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      No tasks found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => openTaskDetail(task)}
                      className="hover:bg-muted/20 transition cursor-pointer"
                    >
                      <td className="p-3 font-medium text-foreground">
                        <div className={`${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-sm">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{task.projectTitle || '—'}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            task.priority === 'URGENT'
                              ? 'destructive'
                              : task.priority === 'HIGH'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-[10px] h-4 font-normal"
                        >
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={task.status}
                          onValueChange={(val) => val && updateTaskStatus(task.id, val as TaskStatus)}
                        >
                          <SelectTrigger className="h-7 text-[11px] w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_COLUMNS.map((col) => (
                              <SelectItem key={col.status} value={col.status} className="text-xs">
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-muted-foreground">{task.assignedToName || 'Unassigned'}</td>
                      <td className="p-3 font-mono text-foreground">
                        {task.estimatedHours}h
                        {task.actualHours > 0 && ` (${task.actualHours}h)`}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => openTaskDetail(task)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </Button>
                        </div>
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
      {/* 3. NEW TASK CREATION DIALOG                              */}
      {/* ======================================================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create Sprint Task</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new task deliverable with project allocation and assignee.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium">Task Title *</label>
              <Input
                placeholder="e.g. Implement Webhook Auth Handler"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 text-xs mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium">Description & Acceptance Criteria</label>
              <Textarea
                placeholder="Technical specifications, requirements, or test notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs mt-1 min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Project</label>
                <Select value={projectId} onValueChange={(val) => val && setProjectId(val)}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium">Assignee</label>
                <Select value={assignedToId} onValueChange={(val) => val && setAssignedToId(val)}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue placeholder="Assign Member" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-xs">
                        {u.name} ({u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Status Lane</label>
                <Select value={status} onValueChange={(val) => val && setStatus(val as TaskStatus)}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_COLUMNS.map((col) => (
                      <SelectItem key={col.status} value={col.status} className="text-xs">
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium">Priority</label>
                <Select value={priority} onValueChange={(val) => val && setPriority(val as TaskPriority)}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW" className="text-xs">Low</SelectItem>
                    <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
                    <SelectItem value="HIGH" className="text-xs">High</SelectItem>
                    <SelectItem value="URGENT" className="text-xs">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Est. Hours</label>
                <Input
                  type="number"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="h-8 text-xs mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="text-xs">
                {submitting ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* 4. TASK DETAIL & EDIT MODAL                              */}
      {/* ======================================================== */}
      {editingTask && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <DialogTitle className="text-base font-semibold">Task Inspector</DialogTitle>
                <Badge
                  variant={
                    editingTask.priority === 'URGENT'
                      ? 'destructive'
                      : editingTask.priority === 'HIGH'
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-[10px] font-normal"
                >
                  {editingTask.priority}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Review and update task deliverable, timestamps, and sprint status.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveTaskDetail} className="space-y-4 pt-2">
              {/* Status Stepper */}
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Status Lane</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TASK_COLUMNS.map((col) => (
                    <button
                      key={col.status}
                      type="button"
                      onClick={() => setEditingTask({ ...editingTask, status: col.status })}
                      className={`px-2 py-1.5 rounded text-xs transition border text-center ${
                        editingTask.status === col.status
                          ? 'bg-foreground text-background font-medium border-foreground'
                          : 'bg-muted/20 text-muted-foreground border-border hover:bg-muted/40'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Task Title *</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="h-8 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium">Description & Scope</label>
                <Textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="text-xs mt-1 min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Project</label>
                  <Select
                    value={editingTask.projectId || ''}
                    onValueChange={(val) => setEditingTask({ ...editingTask, projectId: val })}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium">Assignee</label>
                  <Select
                    value={editingTask.assignedToId || ''}
                    onValueChange={(val) => setEditingTask({ ...editingTask, assignedToId: val })}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="Select Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="text-xs">
                          {u.name} ({u.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium">Priority</label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(val) => val && setEditingTask({ ...editingTask, priority: val as TaskPriority })}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW" className="text-xs">Low</SelectItem>
                      <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
                      <SelectItem value="HIGH" className="text-xs">High</SelectItem>
                      <SelectItem value="URGENT" className="text-xs">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium">Est. Hours</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editingTask.estimatedHours || 0}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, estimatedHours: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 text-xs mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">Actual Hours</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editingTask.actualHours || 0}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, actualHours: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 text-xs mt-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Due Date</label>
                <Input
                  type="date"
                  value={editingTask.dueDate ? editingTask.dueDate.split('T')[0] : ''}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })
                  }
                  className="h-8 text-xs mt-1"
                />
              </div>

              {/* Timestamp Audit */}
              <div className="p-2.5 rounded border border-border bg-muted/20 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
                <span>
                  Started:{' '}
                  {editingTask.startedAt
                    ? new Date(editingTask.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                    : 'Not started'}
                </span>
                <span>
                  Completed:{' '}
                  {editingTask.completedAt
                    ? new Date(editingTask.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                    : 'Not completed'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTask(editingTask.id)}
                  className="text-xs text-destructive hover:text-destructive h-8 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailOpen(false)}
                    className="text-xs h-8"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={updatingTask} className="text-xs h-8">
                    {updatingTask ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
