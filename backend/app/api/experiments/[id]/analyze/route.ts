// API endpoint to analyze experiment results
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ExperimentManager } from '@/lib/experiment-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    
    const results = await ExperimentManager.analyzeExperiment(params.id);

    return NextResponse.json({
      success: true,
      results,
      message: 'Experiment analyzed successfully'
    });
  } catch (error) {
    console.error('Analyze experiment error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}