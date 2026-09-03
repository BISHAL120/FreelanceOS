import { NextRequest, NextResponse } from 'next/server'
import { getIssues, createIssue } from '@/lib/crm-service'

export async function GET() {
  try {
    const issues = await getIssues()
    return NextResponse.json(issues)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.title) {
      return NextResponse.json({ error: 'Issue title is required' }, { status: 400 })
    }
    const issue = await createIssue(body)
    return NextResponse.json(issue, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
