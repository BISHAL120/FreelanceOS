import { NextRequest, NextResponse } from 'next/server'
import { getLeads, createLead } from '@/lib/crm-service'

export async function GET() {
  try {
    const leads = await getLeads()
    return NextResponse.json(leads)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Lead name is required' }, { status: 400 })
    }
    const lead = await createLead(body)
    return NextResponse.json(lead, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
