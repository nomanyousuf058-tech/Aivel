// API endpoint to check current fund status
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { InvestmentManager } from '@/lib/investment-manager';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const fundStatus = await InvestmentManager.getFundStatus();

    return NextResponse.json({
      success: true,
      fundStatus,
      userRole: user.role
    });
  } catch (error) {
    console.error('Get fund status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fund status' },
      { status: 500 }
    );
  }
}