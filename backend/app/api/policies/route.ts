// API endpoints for policy management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { PolicyManager } from '@/lib/policy-manager';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');

    const policies = await PolicyManager.getPolicies(scope || undefined);

    return NextResponse.json({
      success: true,
      policies
    });
  } catch (error) {
    console.error('Get policies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { action } = await request.json();

    if (action === 'initialize') {
      await PolicyManager.initializeDefaultPolicies();
      return NextResponse.json({
        success: true,
        message: 'Default policies initialized successfully'
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Policy operation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}