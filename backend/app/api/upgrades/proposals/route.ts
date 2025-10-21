// API endpoints for upgrade proposal management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { UpgradeGenerator } from '@/lib/upgrade-generator';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = status ? { status } : {};
    
    const proposals = await prisma.upgradeProposal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        upgradeTests: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      proposals,
      total: await prisma.upgradeProposal.count({ where })
    });
  } catch (error) {
    console.error('Get upgrade proposals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upgrade proposals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { action } = await request.json();

    if (action === 'generate') {
      const proposals = await UpgradeGenerator.generateProposals();
      
      // Store proposals in database
      const createdProposals = [];
      for (const proposalData of proposals) {
        const proposal = await prisma.upgradeProposal.create({
          data: {
            title: proposalData.title,
            description: proposalData.description,
            category: proposalData.category,
            priority: proposalData.priority,
            changes: proposalData.changes,
            safetyScore: proposalData.safetyScore,
            riskAnalysis: proposalData.riskAnalysis,
            status: 'PROPOSED',
            proposedBy: 'AI'
          }
        });
        createdProposals.push(proposal);
      }

      return NextResponse.json({
        success: true,
        message: `Generated ${createdProposals.length} upgrade proposals`,
        proposals: createdProposals
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Create upgrade proposals error:', error);
    return NextResponse.json(
      { error: 'Failed to create upgrade proposals' },
      { status: 500 }
    );
  }
}