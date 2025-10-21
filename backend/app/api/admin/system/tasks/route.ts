import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth';
import { AIScheduler } from '@/lib/ai-scheduler';

export async function POST(request: NextRequest) {
  try {
    await requireOwner();
    const { task } = await request.json();

    let result;

    switch (task) {
      case 'analyze_projects':
        result = await AIScheduler.analyzeAllProjects();
        break;
      case 'weekly_report':
        result = await AIScheduler.generateWeeklyReport();
        break;
      case 'growth_decision':
        result = await AIScheduler.makeGrowthDecision();
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown task' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('System task error:', error);
    return NextResponse.json(
      { error: 'Failed to execute system task' },
      { status: 500 }
    );
  }
}