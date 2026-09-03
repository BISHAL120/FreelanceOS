"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Target,
  MoreHorizontal,
  Users,
  Clock,
  FileText,
  ShieldAlert,
  Sparkles,
  Plus,
  UserCheck,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from './auth-context'
import { QuickActionDialog } from './quick-action-dialog'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { currentUser, isAdmin, isLeadGen, isDeveloper } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Leads', href: '/leads', icon: Target },
  ]

  const moreItems = [
    { label: 'Clients', href: '/clients', icon: Users, desc: 'Client profiles & records' },
    { label: 'Invoices', href: '/invoices', icon: FileText, desc: 'Billing, milestones & dues' },
    { label: 'Time Tracker', href: '/time-tracker', icon: Clock, desc: 'Live timer & timesheets' },
    { label: 'Team', href: '/team', icon: UserCheck, desc: 'Agency directory & roles' },
    { label: 'QA & Issues', href: '/qa-issues', icon: ShieldAlert, desc: 'Defect tracker & triage' },
    { label: 'Services', href: '/services', icon: Sparkles, desc: 'Offerings & rate cards' },
  ]

  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href))

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 px-1.5 h-14 flex items-center justify-around shadow-lg safe-area-bottom"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative min-w-0 ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <span className="absolute -top-[1px] h-0.5 w-6 bg-primary rounded-full" />
              )}
              <Icon className={`h-4 w-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 truncate tracking-tight">{item.label}</span>
            </Link>
          )
        })}

        {/* More Trigger */}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative min-w-0 ${
            isMoreActive
              ? 'text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isMoreActive && (
            <span className="absolute -top-[1px] h-0.5 w-6 bg-primary rounded-full" />
          )}
          <MoreHorizontal className={`h-4 w-4 ${isMoreActive ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 truncate tracking-tight">More</span>
        </button>
      </nav>

      {/* More Options Sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-4 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base font-semibold">Workspace Navigation</SheetTitle>
                <SheetDescription className="text-xs">
                  Quick access to all freelance modules
                </SheetDescription>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs font-semibold"
                onClick={() => {
                  setMoreOpen(false)
                  setQuickActionOpen(true)
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Quick New
              </Button>
            </div>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-2.5 pt-4">
            {moreItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'border-primary/50 bg-primary/10 shadow-xs'
                      : 'border-border/60 bg-card hover:bg-accent/40 active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {isActive && (
                      <Badge variant="default" className="text-[9px] h-3.5 px-1 py-0">
                        Active
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {item.desc}
                  </span>
                </Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      <QuickActionDialog
        open={quickActionOpen}
        onOpenChange={setQuickActionOpen}
        onSuccess={() => {
          window.dispatchEvent(new Event('crm-data-updated'))
        }}
      />
    </>
  )
}
