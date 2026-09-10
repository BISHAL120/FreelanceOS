import { NextRequest, NextResponse } from 'next/server'
import { getIndustries, createIndustry } from '@/lib/crm-service'

export async function GET() {
  try {
    const industries = await getIndustries()
    return NextResponse.json(industries)
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Industry name is required' }, { status: 400 })
    }
    const industry = await createIndustry(body)
    return NextResponse.json(industry, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
