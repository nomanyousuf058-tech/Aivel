// API endpoint to view AI task logs
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const tasks = await prisma.aITask.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const logs = await prisma.aILog.findMany({
      where: { type: 'TASK_EXECUTION' },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      tasks,
      logs,
      totalTasks: await prisma.aITask.count(),
      totalLogs: await prisma.aILog.count()
    });
  } catch (error) {
    console.error('Get task logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task logs' },
      { status: 500 }
    );
  }
}