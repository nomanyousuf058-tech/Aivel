// API endpoint to start an experiment
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ExperimentManager } from '@/lib/experiment-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    
    await ExperimentManager.startExperiment(params.id);

    return NextResponse.json({
      success: true,
      message: 'Experiment started successfully'
    });
  } catch (error) {
    console.error('Start experiment error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}