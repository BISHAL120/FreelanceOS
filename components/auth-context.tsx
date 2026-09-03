'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, UserRole } from '@/lib/types'

const DEFAULT_ADMIN: User = {
  id: 'usr-1',
  name: 'Bishal (Owner)',
  email: 'bishal@agency.dev',
  role: 'ADMIN',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  title: 'Agency Founder & Lead Engineer',
  hourlyRate: 150,
  createdAt: new Date().toISOString(),
}

interface AuthContextType {
  currentUser: User
  users: User[]
  setCurrentUser: (user: User) => void
  switchUser: (userId: string) => void
  switchRole: (role: UserRole) => void
  isAdmin: boolean
  isLeadGen: boolean
  isDeveloper: boolean
  canAccessFinances: boolean
  canAccessLeads: boolean
  canManageTeam: boolean
  refreshUsers: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN])
  const [currentUser, setCurrentUserState] = useState<User>(DEFAULT_ADMIN)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)

        // Restore persisted user if present
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('crm_current_user_id') : null
        if (savedId) {
          const match = data.find((u: User) => u.id === savedId)
          if (match) {
            setCurrentUserState(match)
            return
          }
        }
        if (data.length > 0) {
          const admin = data.find((u: User) => u.role === 'ADMIN') || data[0]
          setCurrentUserState(admin)
        }
      }
    } catch {
      // fallback
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user)
    if (typeof window !== 'undefined') {
      localStorage.setItem('crm_current_user_id', user.id)
    }
  }

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId)
    if (found) {
      setCurrentUser(found)
    }
  }

  const switchRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role)
    if (found) {
      setCurrentUser(found)
    }
  }

  const isAdmin = currentUser.role === 'ADMIN'
  const isLeadGen = currentUser.role === 'LEAD_GEN'
  const isDeveloper = currentUser.role === 'DEVELOPER'

  const value: AuthContextType = {
    currentUser,
    users,
    setCurrentUser,
    switchUser,
    switchRole,
    isAdmin,
    isLeadGen,
    isDeveloper,
    canAccessFinances: isAdmin,
    canAccessLeads: isAdmin || isLeadGen,
    canManageTeam: isAdmin,
    refreshUsers: fetchUsers,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
