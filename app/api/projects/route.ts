import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/crm-service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || undefined
    const role = searchParams.get('role') || undefined

    const projects = await getProjects(userId, role)
    return NextResponse.json(projects)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.title) {
      return NextResponse.json({ error: 'Project title is required' }, { status: 400 })
    }
    const project = await createProject(body)
    return NextResponse.json(project, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
