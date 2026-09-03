import { NextResponse } from 'next/server'
import { getDashboardMetrics } from '@/lib/crm-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined
    const role = searchParams.get('role') || undefined

    const metrics = await getDashboardMetrics(userId, role)
    return NextResponse.json(metrics)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
