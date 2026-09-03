import { NextRequest, NextResponse } from 'next/server'
import { reorderTask, getTasks } from '@/lib/crm-service'
import type { TaskStatus } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { taskId, targetStatus, targetIndex, userId, role } = body

    if (!taskId || !targetStatus || targetIndex === undefined) {
      return NextResponse.json(
        { error: 'taskId, targetStatus, and targetIndex are required' },
        { status: 400 }
      )
    }

    await reorderTask(
      taskId,
      targetStatus as TaskStatus,
      Number(targetIndex)
    )

    const updatedTasks = await getTasks(userId, role)

    return NextResponse.json({ success: true, tasks: updatedTasks })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    )
  }
}
