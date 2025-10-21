// API endpoints for AI agent management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { AgentManager } from '@/lib/agent-manager';
import { PolicyManager } from '@/lib/policy-manager';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const agentStatus = await AgentManager.getAgentStatus();

    return NextResponse.json({
      success: true,
      ...agentStatus
    });
  } catch (error) {
    console.error('Get agents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { action, ...data } = await request.json();

    if (action === 'initialize') {
      await AgentManager.initialize();
      return NextResponse.json({
        success: true,
        message: 'AI agents initialized successfully'
      });
    }

    if (action === 'create_defaults') {
      await AgentManager.createDefaultAgents();
      return NextResponse.json({
        success: true,
        message: 'Default agents created successfully'
      });
    }

    if (action === 'execute') {
      const { agentId, task } = data;
      const result = await AgentManager.executeTask(agentId, task);
      
      return NextResponse.json({
        success: result.success,
        result,
        message: result.success ? 'Task executed successfully' : 'Task execution failed'
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Agent operation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}