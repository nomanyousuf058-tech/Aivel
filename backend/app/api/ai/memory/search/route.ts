// API endpoint to search AI memories
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { MemoryManager } from '@/lib/memory-manager';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { query, memoryTypes, minImportance, limit } = await request.json();

    const results = await MemoryManager.searchMemories(
      query,
      memoryTypes,
      minImportance,
      limit || 10
    );

    return NextResponse.json({
      success: true,
      query,
      results,
      total: results.length
    });
  } catch (error) {
    console.error('Memory search error:', error);
    return NextResponse.json(
      { error: 'Failed to search memories' },
      { status: 500 }
    );
  }
}