import { NextRequest, NextResponse } from 'next/server'
import { getTimeEntries, createTimeEntry } from '@/lib/crm-service'

export async function GET() {
  try {
    const entries = await getTimeEntries()
    return NextResponse.json(entries)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    const entry = await createTimeEntry(body)
    return NextResponse.json(entry, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
