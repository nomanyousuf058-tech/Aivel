// API endpoints for revenue period management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { PayoutCalculator } from '@/lib/payout-calculator';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = status ? { status } : {};
    
    const periods = await prisma.revenuePeriod.findMany({
      where,
      include: {
        payout: true
      },
      orderBy: { startDate: 'desc' },
      take: limit
    });

    // Calculate pending balance for active periods
    let pendingBalance = 0;
    if (!status || status === 'ACTIVE') {
      pendingBalance = await PayoutCalculator.getPendingOwnerBalance();
    }

    return NextResponse.json({
      success: true,
      periods,
      pendingBalance,
      total: await prisma.revenuePeriod.count({ where })
    });
  } catch (error) {
    console.error('Get revenue periods error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue periods' },
      { status: 500 }
    );
  }
}