import { NextResponse } from 'next/server'
import { getDashboardMetrics, logActivity } from '@/lib/crm-service'

export async function POST() {
  try {
    await logActivity('Demo Data Reseeded', 'SYSTEM', undefined, 'Freelancer demo dataset initialized')
    const metrics = await getDashboardMetrics()
    return NextResponse.json({ success: true, message: 'CRM data ready', metrics })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
