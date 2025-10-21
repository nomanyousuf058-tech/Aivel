// API endpoint to clean up old memories
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { MemoryManager } from '@/lib/memory-manager';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { maxAgeDays, minImportance } = await request.json();

    const result = await MemoryManager.cleanupMemories(
      maxAgeDays || 90,
      minImportance || 0.2
    );

    return NextResponse.json({
      success: true,
      ...result,
      message: `Cleaned up ${result.deleted} memories`
    });
  } catch (error) {
    console.error('Memory cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup memories' },
      { status: 500 }
    );
  }
}