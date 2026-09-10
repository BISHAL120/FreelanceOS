import { NextRequest, NextResponse } from 'next/server'
import { updateIndustryIdea, deleteIndustryIdea } from '@/lib/crm-service'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ ideaId: string }> }) {
  try {
    const { ideaId } = await params
    const body = await req.json()
    const updated = await updateIndustryIdea(ideaId, body)
    if (!updated) return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ ideaId: string }> }) {
  try {
    const { ideaId } = await params
    const deleted = await deleteIndustryIdea(ideaId)
    if (!deleted) return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
