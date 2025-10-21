import { NextRequest, NextResponse } from 'next/server'
import { chatDeepseek } from '@/app/ai/core/providers/deepseek'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  const res = await chatDeepseek([
    { role: 'system', content: 'You are a precise code assistant.' },
    { role: 'user', content: prompt || 'Say hello' },
  ])
  return NextResponse.json(res)
}

export async function GET() {
  const res = await chatDeepseek([{ role: 'user', content: 'ping' }])
  return NextResponse.json(res)
}



