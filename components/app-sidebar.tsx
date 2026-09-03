"use client"

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Target,
  FolderKanban,
  CheckSquare,
  Clock,
  FileText,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Briefcase,
  UserCheck,
  Play,
  Pause,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useTimer } from './timer-context'
import { useAuth } from './auth-context'

export function AppSidebar() {
  const pathname = usePathname()
  const { isRunning, seconds, startTimer, pauseTimer } = useTimer()
  const { currentUser, isAdmin, isLeadGen, isDeveloper } = useAuth()

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Define role-specific navigation menus
  let coreNav = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'Clients', href: '/clients', icon: Users, badge: '4' },
    { title: 'Leads & Deals', href: '/leads', icon: Target, badge: '4' },
    { title: 'Projects', href: '/projects', icon: FolderKanban, badge: '3' },
    { title: 'Tasks', href: '/tasks', icon: CheckSquare, badge: '5' },
    { title: 'Team Directory', href: '/team', icon: UserCheck, badge: '4' },
  ]

  let secondaryNav = [
    { title: 'Time Tracker', href: '/time-tracker', icon: Clock },
    { title: 'Invoices & Billing', href: '/invoices', icon: FileText, badge: 'Due' },
    { title: 'QA & Issues', href: '/qa-issues', icon: ShieldAlert, badge: '3' },
    { title: 'Rate Card & Services', href: '/services', icon: Sparkles },
  ]

  if (isLeadGen) {
    coreNav = [
      { title: 'Leads Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'Leads & Pipeline', href: '/leads', icon: Target, badge: 'Deals' },
      { title: 'Assigned Tasks', href: '/tasks', icon: CheckSquare, badge: 'Todo' },
      { title: 'Rate Card & Packages', href: '/services', icon: Sparkles },
    ]
    secondaryNav = []
  } else if (isDeveloper) {
    coreNav = [
      { title: 'Dev Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'My Projects', href: '/projects', icon: FolderKanban, badge: 'Assigned' },
      { title: 'My Work Tasks', href: '/tasks', icon: CheckSquare, badge: 'Active' },
      { title: 'QA Defect Triage', href: '/qa-issues', icon: ShieldAlert, badge: 'Bugs' },
      { title: 'Time Tracker', href: '/time-tracker', icon: Clock },
    ]
    secondaryNav = []
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Agency Owner'
      case 'LEAD_GEN':
        return 'Lead Gen Specialist'
      case 'DEVELOPER':
        return 'Developer Teammate'
      default:
        return 'Team Member'
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="flex flex-col overflow-hidden text-left leading-tight">
            <span className="font-semibold text-sm tracking-tight text-foreground">FreelanceOS</span>
            <span className="text-[11px] text-muted-foreground">{getRoleLabel(currentUser.role)}</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {/* Live Timer Micro-Widget in Sidebar (Admin & Devs) */}
        {!isLeadGen && (
          <div className="mx-2 mb-2 p-2.5 rounded-lg border bg-card/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <span className={`inline-block h-2 w-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
                Timer
              </div>
              <span className="font-mono text-xs font-semibold">{formatTimer(seconds)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-1">
              <button
                onClick={isRunning ? pauseTimer : startTimer}
                className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-[11px] font-medium transition ${isRunning ? 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/25' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-3 w-3" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" /> Start
                  </>
                )}
              </button>
              <Link
                href="/time-tracker"
                className="p-1 rounded text-muted-foreground hover:text-foreground text-[11px]"
                title="Open full tracker"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* CORE WORKSPACE */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
            {isLeadGen ? 'Lead Gen Suite' : isDeveloper ? 'Development' : 'Workspace'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={
                        <Link href={item.href} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="text-sm font-medium">{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5 font-normal">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* OPERATIONS & FINANCIALS (Admin only) */}
        {secondaryNav.length > 0 && (
          <SidebarGroup className="mt-1">
            <SidebarGroupLabel className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
              Financials & Delivery
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryNav.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={
                          <Link href={item.href} className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="text-sm font-medium">{item.title}</span>
                            </div>
                            {item.badge && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal text-muted-foreground">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg border">
            <AvatarImage src={currentUser.avatar || ''} alt={currentUser.name} />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-none text-left">
            <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">{currentUser.name}</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">{getRoleLabel(currentUser.role)}</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
