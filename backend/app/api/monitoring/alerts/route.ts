// API endpoints for alert management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { AlertManager } from '@/lib/alert-manager';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    let alerts;
    if (status === 'active') {
      alerts = await AlertManager.getActiveAlerts(severity || undefined);
    } else {
      // For other statuses, you'd implement similar methods
      alerts = [];
    }

    return NextResponse.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { action, alertId, userId, ...data } = await request.json();

    if (action === 'acknowledge') {
      await AlertManager.acknowledgeAlert(alertId, userId);
      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    }

    if (action === 'resolve') {
      await AlertManager.resolveAlert(alertId, userId, data.resolutionNotes);
      return NextResponse.json({
        success: true,
        message: 'Alert resolved successfully'
      });
    }

    if (action === 'stats') {
      const stats = await AlertManager.getAlertStats(data.timeframe);
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
    console.error('Alert operation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}