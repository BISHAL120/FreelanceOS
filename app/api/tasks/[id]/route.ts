import { NextRequest, NextResponse } from 'next/server'
import { updateTask, deleteTask, startTask, completeTask } from '@/lib/crm-service'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    let updated
    if (body.action === 'start') {
      updated = await startTask(id)
    } else if (body.action === 'complete') {
      updated = await completeTask(id)
    } else {
      updated = await updateTask(id, body)
    }

    if (!updated) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = await deleteTask(id)
    if (!deleted) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
