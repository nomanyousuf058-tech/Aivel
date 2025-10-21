import { NextRequest, NextResponse } from 'next/server'
import { triggerZapier } from '@/app/ai/core/providers/automation'

export async function POST(req: NextRequest) {
  const { event, payload } = await req.json()
  const res = await triggerZapier(event || 'test_event', payload || { ok: true })
  return NextResponse.json(res)
}

export async function GET() {
  const res = await triggerZapier('ping', { time: Date.now() })
  return NextResponse.json(res)
}



