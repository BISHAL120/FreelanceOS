"use client"

import React, { useState } from 'react'
import {
  Sparkles,
  Calculator,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Layers,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const PACKAGES = [
  {
    id: 'pkg-1',
    title: 'Full-Stack MVP Sprint',
    price: 5500,
    duration: '2 Weeks Delivery',
    description: 'Turn ideas into a live production SaaS with Next.js, Postgres, and auth.',
    features: [
      'Next.js 16 + React 19 + Tailwind CSS',
      'Database modeling with Prisma & PostgreSQL',
      'Authentication & Protected User Dashboards',
      'Stripe checkout or billing integration',
      'Vercel deployment & production readiness',
    ],
    badge: 'Most Popular',
  },
  {
    id: 'pkg-2',
    title: 'UI/UX & Design System',
    price: 3200,
    duration: '1 Week Delivery',
    description: 'Clean, accessible, high-conversion component library and modern design tokens.',
    features: [
      'Figma wireframes to responsive code',
      'Shadcn UI component customization',
      'Dark/Light theme polish & micro-interactions',
      'Cross-device mobile testing',
      'Performance & accessibility audit',
    ],
  },
  {
    id: 'pkg-3',
    title: 'Monthly Engineering Retainer',
    price: 2400,
    duration: 'Per Month (20 hrs)',
    description: 'Dedicated senior engineering capacity for ongoing features, speed, and maintenance.',
    features: [
      '20 hours guaranteed monthly allocation',
      'Direct Slack / Discord communication',
      '48-hour turn-around on critical bugs',
      'Weekly progress sync & milestone reviews',
      'Unused hours roll over 30 days',
    ],
  },
  {
    id: 'pkg-4',
    title: 'Performance & CWV Audit',
    price: 1500,
    duration: '3 Days Turnaround',
    description: 'Sub-second speed optimization for Next.js and e-commerce websites.',
    features: [
      'Core Web Vitals (LCP, INP, CLS) diagnosis',
      'Bundle size reduction & code splitting',
      'Image optimization & server caching setup',
      'Detailed findings deck & pull request fixes',
    ],
  },
]

export default function ServicesPage() {
  // Interactive Pricing Calculator
  const [hours, setHours] = useState(30)
  const [rate, setRate] = useState(135)
  const [rushFee, setRushFee] = useState(false)
  const [copied, setCopied] = useState(false)

  const rawEstimate = hours * rate
  const finalEstimate = rushFee ? Math.round(rawEstimate * 1.25) : rawEstimate

  const proposalText = `Thank you for considering our collaboration! Based on your scope specifications, here is the estimated project proposal:

• Estimated Scope: ~${hours} engineering hours
• Billing Rate: $${rate}/hr
• Turnaround: ${rushFee ? 'Express Priority Sprint (+25%)' : 'Standard Delivery'}
• Total Estimated Investment: $${finalEstimate.toLocaleString()} USD

Deliverables include architectural setup, iterative weekly milestone demos, responsive QA verification, and deployment support.`

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(proposalText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
          Rate Card & Service Packages
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preset service offerings, hourly rate formulas, and fast proposal pitch calculators.
        </p>
      </div>

      {/* Package Offerings Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> Standard Client Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PACKAGES.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col justify-between hover:shadow-md transition">
              <CardHeader className="pb-3">
                {pkg.badge && (
                  <Badge className="w-fit text-[10px] mb-2">{pkg.badge}</Badge>
                )}
                <CardTitle className="text-base font-bold text-foreground">{pkg.title}</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-foreground font-mono">
                    ${pkg.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground block mt-0.5">{pkg.duration}</span>
                </div>
                <CardDescription className="text-xs mt-2 leading-relaxed">
                  {pkg.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 pt-0 flex-1">
                <div className="pt-3 border-t space-y-1.5">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Proposal & Quote Estimator */}
      <Card className="border-primary/20 bg-muted/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" /> Interactive Client Quote Builder
          </CardTitle>
          <CardDescription className="text-xs">
            Calculate custom project rates and generate ready-to-send pitch proposal copy.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-muted-foreground">Estimated Delivery Hours:</span>
                <span className="font-bold text-foreground font-mono">{hours} hrs</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-muted-foreground">Target Hourly Rate:</span>
                <span className="font-bold text-foreground font-mono">${rate}/hr</span>
              </div>
              <input
                type="range"
                min="75"
                max="250"
                step="5"
                value={rate}
                onChange={(e) => setRate(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t text-xs">
              <input
                type="checkbox"
                id="rush"
                checked={rushFee}
                onChange={(e) => setRushFee(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-primary"
              />
              <label htmlFor="rush" className="text-muted-foreground cursor-pointer">
                Rush Priority Timeline (+25% express fee)
              </label>
            </div>

            <div className="p-4 rounded-xl bg-card border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Estimated Project Quote</span>
                <span className="text-3xl font-bold font-mono text-emerald-600">
                  ${finalEstimate.toLocaleString()}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                ${rate}/hr • {hours} hrs
              </Badge>
            </div>
          </div>

          {/* Generated Proposal Copy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pitch Proposal Copy
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyProposal}
                className="h-7 text-xs gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Proposal Text'}
              </Button>
            </div>
            <pre className="p-4 rounded-xl bg-muted/60 border text-xs font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {proposalText}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
