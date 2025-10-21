// API endpoint to test an upgrade proposal
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { UpgradeTester } from '@/lib/upgrade-tester';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    
    const testResult = await UpgradeTester.testProposal(params.id);

    return NextResponse.json({
      success: testResult.passed,
      testResult,
      message: testResult.passed ? 'All tests passed' : 'Some tests failed'
    });
  } catch (error) {
    console.error('Test proposal error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}