import { NextResponse } from 'next/server'
import { getLeadActivities, createLeadActivity } from '@/lib/crm-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const activities = await getLeadActivities(id)
    return NextResponse.json(activities)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lead activities' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    if (!body.title && !body.content) {
      return NextResponse.json({ error: 'Title or content is required' }, { status: 400 })
    }
    const activity = await createLeadActivity(id, body)
    return NextResponse.json(activity, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to log lead activity' }, { status: 500 })
  }
}
