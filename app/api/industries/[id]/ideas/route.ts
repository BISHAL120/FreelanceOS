import { NextRequest, NextResponse } from 'next/server'
import { createIndustryIdea } from '@/lib/crm-service'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    if (!body.title) {
      return NextResponse.json({ error: 'Idea title is required' }, { status: 400 })
    }
    const idea = await createIndustryIdea(id, body)
    if (!idea) return NextResponse.json({ error: 'Industry not found' }, { status: 404 })
    return NextResponse.json(idea, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
