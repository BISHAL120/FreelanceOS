"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Client, Project } from '@/lib/types'

interface TimerContextType {
  isRunning: boolean
  seconds: number
  description: string
  selectedClientId: string
  selectedProjectId: string
  clients: Client[]
  projects: Project[]
  setDescription: (desc: string) => void
  setSelectedClientId: (id: string) => void
  setSelectedProjectId: (id: string) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  saveTimeEntry: () => Promise<boolean>
  refreshClientsAndProjects: () => Promise<void>
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [description, setDescription] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const refreshClientsAndProjects = async () => {
    try {
      const [cRes, pRes] = await Promise.all([fetch('/api/clients'), fetch('/api/projects')])
      if (cRes.ok) {
        const cData = await cRes.json()
        setClients(cData)
        if (!selectedClientId && cData.length > 0) setSelectedClientId(cData[0].id)
      }
      if (pRes.ok) {
        const pData = await pRes.json()
        setProjects(pData)
        if (!selectedProjectId && pData.length > 0) setSelectedProjectId(pData[0].id)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    refreshClientsAndProjects()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const startTimer = () => setIsRunning(true)
  const pauseTimer = () => setIsRunning(false)
  const resetTimer = () => {
    setIsRunning(false)
    setSeconds(0)
    setDescription('')
  }

  const saveTimeEntry = async () => {
    if (seconds < 10) return false
    const minutes = Math.max(1, Math.round(seconds / 60))
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description || 'Freelance work session',
          durationMinutes: minutes,
          clientId: selectedClientId || null,
          projectId: selectedProjectId || null,
          billable: true,
        }),
      })
      if (res.ok) {
        resetTimer()
        return true
      }
    } catch {
      // ignore
    }
    return false
  }

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        seconds,
        description,
        selectedClientId,
        selectedProjectId,
        clients,
        projects,
        setDescription,
        setSelectedClientId,
        setSelectedProjectId,
        startTimer,
        pauseTimer,
        resetTimer,
        saveTimeEntry,
        refreshClientsAndProjects,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) throw new Error('useTimer must be used within a TimerProvider')
  return context
}
