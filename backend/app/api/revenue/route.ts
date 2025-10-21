import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateRevenueSplit } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    const revenues = await prisma.revenue.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: timeframe === 'all' ? undefined : 30
    });

    const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);
    const ownerEarnings = revenues.reduce((sum, rev) => sum + rev.ownerShare, 0);

    return NextResponse.json({
      revenues,
      summary: {
        totalRevenue,
        ownerEarnings,
        growthFund: totalRevenue - ownerEarnings,
        transactionCount: revenues.length
      }
    });
  } catch (error) {
    console.error('Get revenue error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { growthFund, ownerShare } = calculateRevenueSplit(body.amount);

    const revenue = await prisma.revenue.create({
      data: {
        amount: body.amount,
        type: body.type,
        description: body.description,
        userId: user.id,
        projectId: body.projectId,
        productId: body.productId,
        contentId: body.contentId,
        growthFund,
        ownerShare
      }
    });

    // Update user balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: ownerShare }
      }
    });

    // Update system funds
    await updateSystemFunds(growthFund, ownerShare);

    return NextResponse.json({ revenue });
  } catch (error) {
    console.error('Create revenue error:', error);
    return NextResponse.json(
      { error: 'Failed to record revenue' },
      { status: 500 }
    );
  }
}

async function updateSystemFunds(growthFund: number, ownerShare: number) {
  const systemFund = await prisma.systemFund.findFirst();
  
  if (systemFund) {
    await prisma.systemFund.update({
      where: { id: systemFund.id },
      data: {
        growthFund: { increment: growthFund },
        ownerEarnings: { increment: ownerShare },
        totalRevenue: { increment: growthFund + ownerShare }
      }
    });
  } else {
    await prisma.systemFund.create({
      data: {
        growthFund,
        ownerEarnings: ownerShare,
        totalRevenue: growthFund + ownerShare
      }
    });
  }
}