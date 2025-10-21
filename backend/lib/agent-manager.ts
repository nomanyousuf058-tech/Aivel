// Central manager for AI agent coordination and lifecycle management
import { CodeFixAgent } from './agents/code-fix-agent';
import { OpportunityAgent } from './agents/opportunity-agent';
import { MarketingAgent } from './agents/marketing-agent';
import { SecurityAgent } from './agents/security-agent';

export class AgentManager {
  private static agents: Map<string, any> = new Map();
  private static prisma: any;

  // Initialize all agents
  static async initialize(): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    console.log('🤖 Initializing AI agents...');

    const agentConfigs = await this.prisma.aIAgent.findMany({
      where: { status: 'ACTIVE' }
    });

    for (const config of agentConfigs) {
      await this.initializeAgent(config);
    }

    console.log(`🤖 ${this.agents.size} AI agents initialized`);
  }

  // Initialize a specific agent
  private static async initializeAgent(config: any): Promise<void> {
    let agent: any;

    switch (config.role) {
      case 'CODE_FIXER':
        agent = new CodeFixAgent(config);
        break;
      case 'OPPORTUNITY_FINDER':
        agent = new OpportunityAgent(config);
        break;
      case 'MARKETING_OPTIMIZER':
        agent = new MarketingAgent(config);
        break;
      case 'SECURITY_GUARDIAN':
        agent = new SecurityAgent(config);
        break;
      default:
        console.warn(`Unknown agent role: ${config.role}`);
        return;
    }

    this.agents.set(config.id, agent);
    console.log(`🤖 Agent initialized: ${config.name} (${config.role})`);
  }

  // Execute a task with the appropriate agent
  static async executeTask(agentId: string, task: any): Promise<any> {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    return await agent.executeTask(task);
  }

  // Get agent status and metrics
  static async getAgentStatus(agentId?: string): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    if (agentId) {
      const agent = await this.prisma.aIAgent.findUnique({
        where: { id: agentId },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      return {
        agent,
        isActive: this.agents.has(agentId)
      };
    }

    // Return all agents
    const agents = await this.prisma.aIAgent.findMany({
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { tasksCompleted: 'desc' }
    });

    const systemMetrics = await this.calculateSystemMetrics();

    return {
      agents,
      systemMetrics,
      totalActiveAgents: this.agents.size
    };
  }

  // Calculate system-wide agent metrics
  private static async calculateSystemMetrics(): Promise<any> {
    const tasks = await this.prisma.agentTask.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    const recentTasks = await this.prisma.agentTask.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    const successRate = await this.prisma.agentTask.aggregate({
      where: { status: 'COMPLETED' },
      _avg: { confidence: true }
    });

    return {
      taskDistribution: tasks,
      recentActivity: recentTasks,
      averageConfidence: successRate._avg.confidence || 0,
      totalTasks: await this.prisma.agentTask.count()
    };
  }

  // Create default agents (first-time setup)
  static async createDefaultAgents(): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const defaultAgents = [
      {
        name: 'Code Fixer',
        description: 'AI agent specialized in analyzing and fixing code issues',
        role: 'CODE_FIXER',
        capabilities: ['CODE_ANALYSIS', 'BUG_FIX', 'PERFORMANCE_OPTIMIZATION'],
        minConfidenceThreshold: 0.8,
        maxCostPerTask: 50.0,
        requireHumanApproval: false,
        systemPrompt: 'You are a expert software engineer...',
        model: 'gpt-4',
        temperature: 0.2
      },
      {
        name: 'Opportunity Finder', 
        description: 'AI agent that identifies business growth opportunities',
        role: 'OPPORTUNITY_FINDER',
        capabilities: ['MARKET_ANALYSIS', 'OPPORTUNITY_IDENTIFICATION', 'STRATEGY_PLANNING'],
        minConfidenceThreshold: 0.7,
        maxCostPerTask: 100.0,
        requireHumanApproval: true,
        systemPrompt: 'You are a business strategist...',
        model: 'gpt-4',
        temperature: 0.4
      },
      {
        name: 'Marketing Optimizer',
        description: 'AI agent that optimizes marketing campaigns and strategies',
        role: 'MARKETING_OPTIMIZER',
        capabilities: ['CAMPAIGN_ANALYSIS', 'BUDGET_OPTIMIZATION', 'ROI_IMPROVEMENT'],
        minConfidenceThreshold: 0.75,
        maxCostPerTask: 75.0,
        requireHumanApproval: false,
        systemPrompt: 'You are a marketing expert...',
        model: 'gpt-4',
        temperature: 0.3
      },
      {
        name: 'Security Guardian',
        description: 'AI agent that monitors and analyzes security threats',
        role: 'SECURITY_GUARDIAN',
        capabilities: ['THREAT_DETECTION', 'VULNERABILITY_ANALYSIS', 'SECURITY_MONITORING'],
        minConfidenceThreshold: 0.9,
        maxCostPerTask: 30.0,
        requireHumanApproval: true,
        systemPrompt: 'You are a security expert...',
        model: 'gpt-4',
        temperature: 0.1
      }
    ];

    for (const agentConfig of defaultAgents) {
      await this.prisma.aIAgent.upsert({
        where: { name: agentConfig.name },
        update: {},
        create: agentConfig
      });
    }

    console.log('🤖 Default AI agents created');
  }
}