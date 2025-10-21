// API endpoints for payout management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { PayoutCalculator } from '@/lib/payout-calculator';
import { PayoutProcessor } from '@/lib/payout-processor';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const timeframe = searchParams.get('timeframe') || '30d';
      const stats = await PayoutProcessor.getPayoutStats(timeframe);
      
      return NextResponse.json({
        success: true,
        stats
      });
    }

    if (action === 'revenue-stats') {
      const timeframe = searchParams.get('timeframe') || '30d';
      const stats = await PayoutCalculator.getRevenueStats(timeframe);
      
      return NextResponse.json({
        success: true,
        stats
      });
    }

    // Get payouts list
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = status ? { status } : {};
    
    const payouts = await prisma.payout.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      payouts,
      total: await prisma.payout.count({ where })
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { action, ...data } = await request.json();

    if (action === 'process') {
      const result = await PayoutProcessor.processPayout(data.payoutId);
      
      return NextResponse.json({
        success: result.success,
        result,
        message: result.message
      });
    }

    if (action === 'process-pending') {
      const result = await PayoutProcessor.processPendingPayouts();
      
      return NextResponse.json({
        success: true,
        ...result,
        message: `Processed ${result.processed} payouts`
      });
    }

    if (action === 'create-period') {
      const { startDate, endDate, autoPayout } = data;
      const periodId = await PayoutCalculator.createRevenuePeriod(
        new Date(startDate),
        new Date(endDate),
        autoPayout !== false
      );
      
      return NextResponse.json({
        success: true,
        periodId,
        message: 'Revenue period created successfully'
      });
    }

    if (action === 'close-period') {
      const result = await PayoutCalculator.closeRevenuePeriod(data.periodId);
      
      return NextResponse.json({
        success: true,
        ...result,
        message: 'Revenue period closed successfully'
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payout operation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}