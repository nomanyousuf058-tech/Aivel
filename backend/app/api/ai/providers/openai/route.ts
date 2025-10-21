import { NextRequest, NextResponse } from 'next/server'
import { chatOpenAI } from '@/app/ai/core/providers/openai'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  const res = await chatOpenAI([
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: prompt || 'Say hello' },
  ])
  return NextResponse.json(res)
}

export async function GET() {
  const res = await chatOpenAI([{ role: 'user', content: 'ping' }])
  return NextResponse.json(res)
}



