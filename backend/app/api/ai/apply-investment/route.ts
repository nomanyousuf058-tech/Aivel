// API endpoint to apply an investment proposal
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { InvestmentManager } from '@/lib/investment-manager';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { proposalId, autoApply = false } = await request.json();

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    const result = await InvestmentManager.applyInvestment(proposalId, autoApply);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Apply investment error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}