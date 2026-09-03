import { NextRequest, NextResponse } from 'next/server'
import { getTasks, createTask } from '@/lib/crm-service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || undefined
    const role = searchParams.get('role') || undefined

    const tasks = await getTasks(userId, role)
    return NextResponse.json(tasks)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }
    const task = await createTask(body)
    return NextResponse.json(task, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
