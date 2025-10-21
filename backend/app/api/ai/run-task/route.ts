// API endpoint to manually run AI tasks
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { AIWorker } from '@/lib/worker';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const taskName = searchParams.get('name');

    if (!taskName) {
      return NextResponse.json(
        { error: 'Task name is required' },
        { status: 400 }
      );
    }

    const result = await AIWorker.processTask(taskName);

    return NextResponse.json({
      task: taskName,
      success: result.success,
      data: result.data,
      error: result.error
    });
  } catch (error) {
    console.error('Run task error:', error);
    return NextResponse.json(
      { error: 'Failed to run task' },
      { status: 500 }
    );
  }
}