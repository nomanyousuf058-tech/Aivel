// API endpoint to generate investment proposals
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { InvestmentManager } from '@/lib/investment-manager';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const result = await InvestmentManager.proposeInvestment();

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Propose investment error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}