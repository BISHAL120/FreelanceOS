import { NextRequest, NextResponse } from 'next/server'
import { getIndustry, updateIndustry, deleteIndustry } from '@/lib/crm-service'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const industry = await getIndustry(id)
    if (!industry) return NextResponse.json({ error: 'Industry not found' }, { status: 404 })
    return NextResponse.json(industry)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = await updateIndustry(id, body)
    if (!updated) return NextResponse.json({ error: 'Industry not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = await deleteIndustry(id)
    if (!deleted) return NextResponse.json({ error: 'Industry not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
