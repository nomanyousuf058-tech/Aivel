// API endpoint to approve an upgrade proposal
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    
    const proposal = await prisma.upgradeProposal.findUnique({
      where: { id: params.id }
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Upgrade proposal not found' },
        { status: 404 }
      );
    }

    const updatedProposal = await prisma.upgradeProposal.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });

    // Log approval
    await prisma.aILog.create({
      data: {
        type: 'SYSTEM_UPDATE',
        summary: `Upgrade proposal approved: ${proposal.title}`,
        details: { proposalId: params.id },
        agent: 'Admin',
        confidence: 0.9
      }
    });

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: 'Upgrade proposal approved'
    });
  } catch (error) {
    console.error('Approve proposal error:', error);
    return NextResponse.json(
      { error: 'Failed to approve proposal' },
      { status: 500 }
    );
  }
}