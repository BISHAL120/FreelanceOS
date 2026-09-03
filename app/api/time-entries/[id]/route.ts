import { NextRequest, NextResponse } from 'next/server'
import { deleteTimeEntry } from '@/lib/crm-service'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = await deleteTimeEntry(id)
    if (!deleted) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
