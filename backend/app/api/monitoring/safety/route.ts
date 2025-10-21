// API endpoints for safety monitoring
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { SafetyChecker } from '@/lib/safety-checker';
import { RateLimiter } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'safety-stats') {
      const timeframe = searchParams.get('timeframe') || '7d';
      const stats = await SafetyChecker.getSafetyStats(timeframe);
      
      return NextResponse.json({
        success: true,
        stats
      });
    }

    if (action === 'rate-limit-stats') {
      const stats = await RateLimiter.getSystemRateLimitStats();
      return NextResponse.json({
        success: true,
        stats
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Safety monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety data' },
      { status: 500 }
    );
  }
}