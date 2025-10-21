// API endpoint to store new AI memory
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { MemoryManager } from '@/lib/memory-manager';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { memoryType, content, importance } = await request.json();

    if (!memoryType || !content) {
      return NextResponse.json(
        { error: 'Memory type and content are required' },
        { status: 400 }
      );
    }

    const memoryId = await MemoryManager.storeMemory({
      memoryType,
      content,
      importance
    });

    return NextResponse.json({
      success: true,
      memoryId,
      message: 'Memory stored successfully'
    });
  } catch (error) {
    console.error('Memory store error:', error);
    return NextResponse.json(
      { error: 'Failed to store memory' },
      { status: 500 }
    );
  }
}