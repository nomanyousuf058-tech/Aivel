// API endpoint to run the auto-upgrade cycle
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { UpgradeCoordinator } from '@/lib/upgrade-coordinator';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const result = await UpgradeCoordinator.runAutoUpgradeCycle();

    return NextResponse.json({
      success: result.success,
      ...result
    });
  } catch (error) {
    console.error('Auto-upgrade cycle error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const status = await UpgradeCoordinator.getPipelineStatus();

    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get upgrade status error:', error);
    return NextResponse.json(
      { error: 'Failed to get upgrade status' },
      { status: 500 }
    );
  }
}