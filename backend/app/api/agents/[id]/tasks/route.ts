// API endpoints for agent task management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AgentManager } from '@/lib/agent-manager';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = { agentId: id };
    if (status) where.status = status;

    const tasks = await prisma.agentTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      tasks,
      total: await prisma.agentTask.count({ where })
    });
  } catch (error) {
    console.error('Get agent tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent tasks' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await context.params;
    const { task } = await request.json();

    const result = await AgentManager.executeTask(id, task);

    return NextResponse.json({
      success: result.success,
      result,
      message: result.success ? 'Task executed successfully' : 'Task execution failed'
    });
  } catch (error: any) {
    console.error('Execute agent task error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}