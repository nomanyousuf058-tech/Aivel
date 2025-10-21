// API endpoints for experiment management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ExperimentManager, ExperimentConfig } from '@/lib/experiment-manager';
import { ExperimentSuggestor } from '@/lib/experiment-suggestor';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = status ? { status } : {};
    
    const experiments = await prisma.experiment.findMany({
      where,
      include: {
        variants: true,
        summaries: {
          orderBy: { date: 'desc' },
          take: 7
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      experiments,
      total: await prisma.experiment.count({ where })
    });
  } catch (error) {
    console.error('Get experiments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { action, ...data } = await request.json();

    if (action === 'create') {
      const experimentConfig: ExperimentConfig = data;
      const experimentId = await ExperimentManager.createExperiment(experimentConfig);
      
      return NextResponse.json({
        success: true,
        experimentId,
        message: 'Experiment created successfully'
      });
    }

    if (action === 'suggest') {
      const suggestions = await ExperimentSuggestor.generateSuggestions();
      
      return NextResponse.json({
        success: true,
        suggestions,
        message: `Generated ${suggestions.length} experiment suggestions`
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Experiment operation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}