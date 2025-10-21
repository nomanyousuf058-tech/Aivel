// API endpoint to record experiment events
import { NextRequest, NextResponse } from 'next/server';
import { ExperimentManager } from '@/lib/experiment-manager';

export async function POST(request: NextRequest) {
  try {
    const { 
      experimentId, 
      variantName, 
      eventType, 
      userId, 
      eventValue, 
      metadata,
      sessionId 
    } = await request.json();

    if (!experimentId || !variantName || !eventType) {
      return NextResponse.json(
        { error: 'experimentId, variantName, and eventType are required' },
        { status: 400 }
      );
    }

    await ExperimentManager.recordEvent(
      experimentId,
      variantName,
      eventType,
      userId,
      eventValue,
      metadata
    );

    return NextResponse.json({
      success: true,
      message: 'Event recorded successfully'
    });
  } catch (error) {
    console.error('Record event error:', error);
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    );
  }
}