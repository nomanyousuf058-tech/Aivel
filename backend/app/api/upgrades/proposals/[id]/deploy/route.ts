// API endpoint to deploy an upgrade proposal
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { DeploymentManager } from '@/lib/deployment-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const { environment = 'STAGING' } = await request.json();
    
    const deployResult = await DeploymentManager.deployUpgrade(params.id, environment);

    return NextResponse.json({
      success: deployResult.success,
      ...deployResult
    });
  } catch (error) {
    console.error('Deploy proposal error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}