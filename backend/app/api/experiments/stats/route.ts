// API endpoint to get experiment statistics
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ExperimentManager } from '@/lib/experiment-manager';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const stats = await ExperimentManager.getExperimentStats();

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get experiment stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get experiment stats' },
      { status: 500 }
    );
  }
}