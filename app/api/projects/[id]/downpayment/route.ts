import { NextRequest, NextResponse } from 'next/server'
import { recordProjectDownpayment } from '@/lib/crm-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await recordProjectDownpayment(id, body)
    if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record downpayment' }, { status: 500 })
  }
}
