// API endpoint to get memory system statistics
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { MemoryManager } from '@/lib/memory-manager';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const stats = await MemoryManager.getMemoryStats();

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Memory stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get memory stats' },
      { status: 500 }
    );
  }
}