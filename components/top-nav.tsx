"use client"

import React, { useState } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Play,
  Pause,
  Plus,
  Moon,
  Sun,
  Search,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  Target,
  ShieldCheck,
  Briefcase,
  Code2,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTimer } from './timer-context'
import { useAuth } from './auth-context'
import { QuickActionDialog } from './quick-action-dialog'

export function TopNav() {
  const { theme, setTheme } = useTheme()
  const { isRunning, seconds, startTimer, pauseTimer } = useTimer()
  const { currentUser, users, switchUser, isAdmin, isLeadGen, isDeveloper } = useAuth()
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [actionType, setActionType] = useState<'client' | 'project' | 'lead' | 'task' | 'invoice'>('task')

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const openQuickAction = (type: 'client' | 'project' | 'lead' | 'task' | 'invoice') => {
    setActionType(type)
    setQuickActionOpen(true)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] py-0">Admin</Badge>
      case 'LEAD_GEN':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] py-0">Lead Gen</Badge>
      case 'DEVELOPER':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] py-0">Developer</Badge>
      default:
        return null
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <div className="relative hidden md:flex items-center w-64">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search CRM... (⌘K)"
              className="h-8 pl-8 text-xs bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Header Live Timer Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/40 text-xs font-mono">
            <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
            <span className="font-semibold text-foreground">{formatTimer(seconds)}</span>
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className="p-1 rounded-full hover:bg-muted transition text-foreground"
              title={isRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isRunning ? <Pause className="h-3.5 w-3.5 text-amber-500" /> : <Play className="h-3.5 w-3.5 text-emerald-500" />}
            </button>
          </div>

          {/* Role & User Switcher Dropdown (RBAC) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="h-8 gap-2 text-xs border-dashed px-2.5">
                  <div className="flex items-center gap-1.5">
                    {isAdmin && <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />}
                    {isLeadGen && <Briefcase className="h-3.5 w-3.5 text-emerald-600" />}
                    {isDeveloper && <Code2 className="h-3.5 w-3.5 text-blue-600" />}
                    <span className="font-medium max-w-[100px] truncate">{currentUser.name}</span>
                  </div>
                  {getRoleBadge(currentUser.role)}
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs">
                <div className="font-semibold text-foreground">Active Role & Profile</div>
                <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                  Switch user to preview specific permissions
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {users.map((u) => {
                const isSelected = u.id === currentUser.id
                return (
                  <DropdownMenuItem
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className={`text-xs flex items-center justify-between cursor-pointer py-2 ${
                      isSelected ? 'bg-accent font-medium' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={u.avatar || ''} alt={u.name} />
                        <AvatarFallback className="text-[10px]">
                          {u.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-[10px] text-muted-foreground">{u.title || u.email}</div>
                      </div>
                    </div>
                    {getRoleBadge(u.role)}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* "+ New" Quick Action Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" className="h-8 gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  <span>New</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Quick Action</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openQuickAction('task')} className="text-xs cursor-pointer">
                <CheckSquare className="mr-2 h-4 w-4" /> Task
              </DropdownMenuItem>
              {(isAdmin || isLeadGen) && (
                <DropdownMenuItem onClick={() => openQuickAction('lead')} className="text-xs cursor-pointer">
                  <Target className="mr-2 h-4 w-4" /> Lead / Deal
                </DropdownMenuItem>
              )}
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => openQuickAction('client')} className="text-xs cursor-pointer">
                    <Users className="mr-2 h-4 w-4" /> Client
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openQuickAction('project')} className="text-xs cursor-pointer">
                    <FolderKanban className="mr-2 h-4 w-4" /> Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openQuickAction('invoice')} className="text-xs cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" /> Invoice
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      <QuickActionDialog
        open={quickActionOpen}
        onOpenChange={setQuickActionOpen}
        initialType={actionType}
        onSuccess={() => {
          window.dispatchEvent(new Event('crm-data-updated'))
        }}
      />
    </>
  )
}
