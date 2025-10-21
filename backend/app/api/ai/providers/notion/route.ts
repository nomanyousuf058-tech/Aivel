import { NextRequest, NextResponse } from 'next/server'
import { notionSearch } from '@/app/ai/core/providers/notion'

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  const res = await notionSearch(query || 'Aivel tasks')
  return NextResponse.json(res)
}

export async function GET() {
  const res = await notionSearch('Aivel')
  return NextResponse.json(res)
}



