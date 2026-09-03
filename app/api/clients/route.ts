import { NextRequest, NextResponse } from 'next/server'
import { getClients, createClient } from '@/lib/crm-service'

export async function GET() {
  try {
    const clients = await getClients()
    return NextResponse.json(clients)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }
    const client = await createClient(body)
    return NextResponse.json(client, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
