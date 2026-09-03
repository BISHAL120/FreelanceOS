import { NextRequest, NextResponse } from 'next/server'
import { convertLeadToClient } from '@/lib/crm-service'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await convertLeadToClient(id)
    return NextResponse.json(result)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
