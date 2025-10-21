// API endpoints for audit log management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const filters = {
      action: searchParams.get('action'),
      resource: searchParams.get('resource'),
      userId: searchParams.get('userId'),
      severity: searchParams.get('severity'),
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: parseInt(searchParams.get('limit') || '100')
    };

    const logs = await AuditLogger.getAuditLogs(filters);

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { action } = await request.json();

    if (action === 'stats') {
      const { timeframe } = await request.json();
      const stats = await AuditLogger.getAuditStats(timeframe);
      
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
    console.error('Audit operation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}