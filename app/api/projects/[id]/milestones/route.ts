import { NextRequest, NextResponse } from 'next/server'
import { getProjectMilestones, createProjectMilestone } from '@/lib/crm-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const milestones = await getProjectMilestones(id)
    return NextResponse.json(milestones)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const milestone = await createProjectMilestone(id, body)
    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 })
  }
}
