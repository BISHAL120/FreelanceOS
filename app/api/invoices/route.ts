import { NextRequest, NextResponse } from 'next/server'
import { getInvoices, createInvoice } from '@/lib/crm-service'

export async function GET() {
  try {
    const invoices = await getInvoices()
    return NextResponse.json(invoices)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.clientId) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 })
    }
    const invoice = await createInvoice(body)
    return NextResponse.json(invoice, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
