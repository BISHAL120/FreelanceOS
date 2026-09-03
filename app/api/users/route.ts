import { NextResponse } from 'next/server'
import { getUsers, createUser } from '@/lib/crm-service'

export async function GET() {
  try {
    const users = await getUsers()
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch team users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const user = await createUser(body)
    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
