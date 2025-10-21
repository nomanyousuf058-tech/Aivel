import { NextRequest, NextResponse } from 'next/server'
import { generateMarketingCopy } from '@/app/ai/core/providers/jasper'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  const res = await generateMarketingCopy(prompt || 'Write a compelling product description for Aivel')
  return NextResponse.json(res)
}

export async function GET() {
  const res = await generateMarketingCopy('Write a short brand tagline for Aivel')
  return NextResponse.json(res)
}



