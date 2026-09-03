import { NextRequest, NextResponse } from 'next/server'
import { updateIssue, deleteIssue } from '@/lib/crm-service'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = await updateIssue(id, body)
    if (!updated) return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = await deleteIssue(id)
    if (!deleted) return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
