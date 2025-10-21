// API endpoints for payout method management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const methods = await prisma.payoutMethod.findMany({
      where: { ownerId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    return NextResponse.json({
      success: true,
      methods
    });
  } catch (error) {
    console.error('Get payout methods error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { type, details, isDefault } = await request.json();

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.payoutMethod.updateMany({
        where: { ownerId: user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const method = await prisma.payoutMethod.create({
      data: {
        ownerId: user.id,
        type,
        details,
        isDefault: isDefault || false,
        status: 'ACTIVE'
      }
    });

    // Log method creation
    await import('@/lib/audit-logger').then(({ AuditLogger }) =>
      AuditLogger.logAction({
        action: 'PAYOUT_METHOD_ADDED',
        resource: 'PAYOUT_METHOD',
        resourceId: method.id,
        userId: user.id,
        context: { type, isDefault },
        severity: 'INFO'
      })
    );

    return NextResponse.json({
      success: true,
      method,
      message: 'Payout method added successfully'
    });
  } catch (error) {
    console.error('Add payout method error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}