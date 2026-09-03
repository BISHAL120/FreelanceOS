import { NextRequest, NextResponse } from 'next/server'
import {
  updateProjectMilestone,
  deleteProjectMilestone,
  recordMilestonePayment,
} from '@/lib/crm-service'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mId: string }> }
) {
  try {
    const { mId } = await params
    const body = await request.json()

    if (body.action === 'record_payment') {
      const updated = await recordMilestonePayment(mId, {
        paidAmount: body.paidAmount,
        paymentMethod: body.paymentMethod,
        paymentNote: body.paymentNote,
        paidAt: body.paidAt,
      })
      if (!updated) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
      return NextResponse.json(updated)
    }

    const updated = await updateProjectMilestone(mId, body)
    if (!updated) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mId: string }> }
) {
  try {
    const { mId } = await params
    const success = await deleteProjectMilestone(mId)
    if (!success) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 })
  }
}
