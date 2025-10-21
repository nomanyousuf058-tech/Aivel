// AI-powered investment manager for growth fund allocation
import { prisma } from './db';

export interface InvestmentProposal {
  title: string;
  description: string;
  cost: number;
  expectedROI: number; // Percentage
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'API_UPGRADE' | 'MARKETING' | 'INFRASTRUCTURE' | 'TOOL_DEVELOPMENT' | 'CONTENT';
}

export class InvestmentManager {
  // Propose new investment based on current system state
  static async proposeInvestment(): Promise<any> {
    const systemFund = await prisma.systemFund.findFirst();
    if (!systemFund) {
      throw new Error('System fund not found');
    }

    const availableFunds = systemFund.growthFund;
    const monthlyBudget = systemFund.monthlyBudget;

    // Get system metrics to inform investment decisions
    const [recentRevenue, projectCount, userCount] = await Promise.all([
      prisma.revenue.aggregate({
        where: { 
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        _sum: { amount: true }
      }),
      prisma.project.count(),
      prisma.user.count()
    ]);

    // 🔥 NEW: Search past investment memories for insights (if MemoryManager exists)
    let pastInvestments: any[] = [];
    try {
      // Check if MemoryManager is available
      const { MemoryManager } = await import('./memory-manager');
      pastInvestments = await MemoryManager.searchMemories(
        'investment ROI success failure',
        ['INVESTMENT_DECISION', 'SUCCESS_STORY', 'FAILURE_LEARNING'],
        0.5,
        5
      );
      console.log('🧠 Using past investment insights:', pastInvestments.length);
    } catch (error) {
      console.log('Memory manager not available, using basic investment logic');
    }

    // AI Decision Logic - Enhanced with memory
    const proposals: InvestmentProposal[] = [];
    
    // Rule 1: If low user growth, propose marketing (with memory insights)
    if (userCount < 100 && availableFunds >= 500) {
      // Check if marketing investments worked well in the past
      const marketingMemories = pastInvestments.filter(m => 
        m.content.toLowerCase().includes('marketing') ||
        m.content.toLowerCase().includes('campaign')
      );
      
      const marketingSuccessRate = this.calculateSuccessRate(marketingMemories);
      
      proposals.push({
        title: 'Targeted Marketing Campaign',
        description: `Run focused ads to acquire new users. ${pastInvestments.length > 0 ? `Past success rate: ${marketingSuccessRate}%` : 'New user acquisition strategy'}`,
        cost: 500,
        expectedROI: marketingSuccessRate > 0 ? 150 * (marketingSuccessRate / 100) : 150,
        riskLevel: marketingSuccessRate > 60 ? 'LOW' : marketingSuccessRate > 30 ? 'MEDIUM' : 'HIGH',
        category: 'MARKETING'
      });
    }

    // Rule 2: If high project count but low revenue, propose tool development
    if (projectCount > 10 && (recentRevenue._sum.amount || 0) < 1000 && availableFunds >= 800) {
      const toolMemories = pastInvestments.filter(m => 
        m.content.toLowerCase().includes('tool') ||
        m.content.toLowerCase().includes('development')
      );
      
      const toolSuccessRate = this.calculateSuccessRate(toolMemories);
      
      proposals.push({
        title: 'Develop Premium AI Tool',
        description: `Create advanced AI tool. ${pastInvestments.length > 0 ? `Past success rate: ${toolSuccessRate}%` : 'Revenue diversification strategy'}`,
        cost: 800,
        expectedROI: toolSuccessRate > 0 ? 200 * (toolSuccessRate / 100) : 200,
        riskLevel: toolSuccessRate > 60 ? 'LOW' : toolSuccessRate > 30 ? 'MEDIUM' : 'HIGH',
        category: 'TOOL_DEVELOPMENT'
      });
    }

    // Rule 3: Always have infrastructure upgrade option
    if (availableFunds >= 300) {
      proposals.push({
        title: 'API Quota Upgrade',
        description: 'Increase AI API limits for better performance and reliability',
        cost: 300,
        expectedROI: 50,
        riskLevel: 'LOW',
        category: 'API_UPGRADE'
      });
    }

    // Rule 4: Content creation for SEO and affiliate revenue
    if (availableFunds >= 200) {
      const contentMemories = pastInvestments.filter(m => 
        m.content.toLowerCase().includes('content') ||
        m.content.toLowerCase().includes('seo')
      );
      
      const contentSuccessRate = this.calculateSuccessRate(contentMemories);
      
      proposals.push({
        title: 'Content Marketing Boost',
        description: `Create SEO-optimized content. ${pastInvestments.length > 0 ? `Past success rate: ${contentSuccessRate}%` : 'SEO and affiliate revenue strategy'}`,
        cost: 200,
        expectedROI: contentSuccessRate > 0 ? 120 * (contentSuccessRate / 100) : 120,
        riskLevel: contentSuccessRate > 70 ? 'LOW' : 'MEDIUM',
        category: 'CONTENT'
      });
    }

    // Filter proposals by available funds and safety rules
    const affordableProposals = proposals.filter(p => 
      p.cost <= availableFunds && 
      p.cost <= monthlyBudget * 0.1 // Max 10% of monthly budget per investment
    );

    // Sort by ROI/risk ratio (higher ROI, lower risk first)
    const scoredProposals = affordableProposals.map(p => ({
      ...p,
      score: (p.expectedROI / 100) * (p.riskLevel === 'LOW' ? 1 : p.riskLevel === 'MEDIUM' ? 0.7 : 0.4)
    })).sort((a, b) => b.score - a.score);

    // Create proposal records in database
    const createdProposals = [];
    for (const proposal of scoredProposals.slice(0, 3)) { // Top 3 proposals
      const dbProposal = await prisma.investmentProposal.create({
        data: {
          title: proposal.title,
          description: proposal.description,
          cost: proposal.cost,
          expectedROI: proposal.expectedROI,
          riskLevel: proposal.riskLevel,
          status: 'PROPOSED',
          proposedBy: 'AI'
        }
      });
      createdProposals.push(dbProposal);
    }

    // Log the investment proposal activity
    await prisma.aILog.create({
      data: {
        type: 'INVESTMENT_PROPOSAL',
        summary: `AI proposed ${createdProposals.length} investment options${pastInvestments.length > 0 ? ' using memory insights' : ''}`,
        details: {
          availableFunds,
          proposals: createdProposals,
          monthlyBudget,
          memoriesUsed: pastInvestments.length,
          userCount,
          projectCount,
          recentRevenue: recentRevenue._sum.amount
        },
        agent: 'InvestmentAgent',
        confidence: 0.8,
        costEstimate: createdProposals.reduce((sum, p) => sum + p.cost, 0)
      }
    });

    return {
      availableFunds,
      monthlyBudget,
      proposals: createdProposals,
      memoriesUsed: pastInvestments.length,
      message: `Generated ${createdProposals.length} investment proposals${pastInvestments.length > 0 ? ` using ${pastInvestments.length} past experiences` : ''}`
    };
  }

  // Apply an investment (auto or manual)
  static async applyInvestment(proposalId: string, autoApply: boolean = false): Promise<any> {
    const proposal = await prisma.investmentProposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      throw new Error('Investment proposal not found');
    }

    if (proposal.status !== 'PROPOSED' && proposal.status !== 'APPROVED') {
      throw new Error('Proposal cannot be applied in current status');
    }

    const systemFund = await prisma.systemFund.findFirst();
    if (!systemFund) {
      throw new Error('System fund not found');
    }

    // Safety checks
    if (proposal.cost > systemFund.growthFund) {
      throw new Error('Insufficient growth fund for this investment');
    }

    if (proposal.cost > 5000 && autoApply) {
      throw new Error('Investments over PKR 5,000 require manual approval');
    }

    if (systemFund.ownerBalance < 200 && autoApply) {
      throw new Error('Owner balance below safety threshold (PKR 200)');
    }

    // Update proposal status
    await prisma.investmentProposal.update({
      where: { id: proposalId },
      data: {
        status: 'EXECUTED',
        executedAt: new Date()
      }
    });

    // Deduct from growth fund
    await prisma.systemFund.update({
      where: { id: systemFund.id },
      data: {
        growthFund: { decrement: proposal.cost },
        totalInvested: { increment: proposal.cost }
      }
    });

    // Simulate investment result (in real system, this would call actual services)
    const simulatedResult = {
      actualROI: this.simulateROI(proposal.expectedROI, proposal.riskLevel),
      impact: 'positive', // positive, neutral, negative
      lessons: 'Investment applied successfully',
      timestamp: new Date().toISOString()
    };

    // Update proposal with result
    await prisma.investmentProposal.update({
      where: { id: proposalId },
      data: {
        result: simulatedResult
      }
    });

    // 🔥 NEW: Learn from this investment decision if MemoryManager exists
    try {
      const { MemoryManager } = await import('./memory-manager');
      await MemoryManager.learnFromInvestment(
        proposal.title,
        proposal.cost,
        proposal.expectedROI,
        simulatedResult.actualROI,
        proposal.riskLevel
      );
    } catch (error) {
      console.log('Memory manager not available for learning');
    }

    // Log the investment execution
    await prisma.aILog.create({
      data: {
        type: 'GROWTH_DECISION',
        summary: `Executed investment: ${proposal.title} (PKR ${proposal.cost})`,
        details: {
          proposal: proposal,
          result: simulatedResult,
          remainingFunds: systemFund.growthFund - proposal.cost,
          autoApplied: autoApply
        },
        agent: 'InvestmentAgent',
        confidence: 0.7,
        costEstimate: proposal.cost
      }
    });

    return {
      success: true,
      proposal: proposal,
      result: simulatedResult,
      remainingGrowthFund: systemFund.growthFund - proposal.cost,
      autoApplied: autoApply
    };
  }

  // Simulate ROI based on expected ROI and risk level
  private static simulateROI(expectedROI: number, riskLevel: string): number {
    const baseVariance = riskLevel === 'HIGH' ? 0.4 : riskLevel === 'MEDIUM' ? 0.2 : 0.1;
    const variance = (Math.random() - 0.5) * 2 * baseVariance;
    return Math.max(0, expectedROI * (1 + variance)); // Never negative ROI
  }

  // Calculate success rate from memory insights
  private static calculateSuccessRate(memories: any[]): number {
    if (memories.length === 0) return 0;
    
    let successCount = 0;
    memories.forEach(memory => {
      if (memory.content.toLowerCase().includes('success') || 
          memory.content.toLowerCase().includes('positive') ||
          (memory.content.includes('ROI') && parseFloat(memory.content.match(/ROI: (\d+)%/)?.[1] || '0') > 50)) {
        successCount++;
      }
    });
    
    return Math.round((successCount / memories.length) * 100);
  }

  // Get current fund status
  static async getFundStatus(): Promise<any> {
    const systemFund = await prisma.systemFund.findFirst();
    if (!systemFund) {
      // Initialize system fund if not exists
      const newFund = await prisma.systemFund.create({
        data: {
          growthFund: 0,
          ownerBalance: 0,
          totalRevenue: 0,
          monthlyBudget: 10000, // PKR 10,000
          autoInvest: false,
          autoDeployEnabled: false,
          totalInvested: 0,
          totalExpenses: 0,
          currentMonth: new Date()
        }
      });
      return newFund;
    }

    const pendingProposals = await prisma.investmentProposal.count({
      where: { status: 'PROPOSED' }
    });

    const recentInvestments = await prisma.investmentProposal.findMany({
      where: { 
        status: 'EXECUTED',
        executedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { executedAt: 'desc' },
      take: 5
    });

    return {
      ...systemFund,
      pendingProposals,
      recentInvestments,
      safetyStatus: this.checkSafetyStatus(systemFund)
    };
  }

  // Check system safety status
  private static checkSafetyStatus(systemFund: any): any {
    const issues = [];
    
    if (systemFund.ownerBalance < 200) {
      issues.push('Owner balance below safety threshold (PKR 200)');
    }
    
    if (systemFund.growthFund > systemFund.monthlyBudget * 0.5) {
      issues.push('Growth fund exceeds 50% of monthly budget - consider owner payout');
    }

    if (systemFund.growthFund < 100) {
      issues.push('Growth fund very low - prioritize revenue generation');
    }

    return {
      isSafe: issues.length === 0,
      issues,
      recommendations: issues.length > 0 ? [
        'Monitor owner balance closely',
        'Consider partial owner payout if growth fund is large',
        'Focus on revenue generation if funds are low'
      ] : ['System operating within safe parameters']
    };
  }

  // Auto-invest if enabled and conditions are met
  static async autoInvestIfEnabled(): Promise<any> {
    const systemFund = await prisma.systemFund.findFirst();
    
    if (!systemFund?.autoInvest) {
      return { enabled: false, message: 'Auto-invest disabled' };
    }

    // Check if we have sufficient funds for auto-investment
    if (systemFund.growthFund < 200) {
      return { enabled: true, message: 'Auto-invest enabled but insufficient funds' };
    }

    // Get the best proposal
    const proposals = await prisma.investmentProposal.findMany({
      where: { 
        status: 'PROPOSED',
        cost: { lte: systemFund.growthFund }
      },
      orderBy: { expectedROI: 'desc' },
      take: 1
    });

    if (proposals.length === 0) {
      return { enabled: true, message: 'No suitable proposals for auto-investment' };
    }

    const bestProposal = proposals[0];

    // Apply the best proposal automatically
    try {
      const result = await this.applyInvestment(bestProposal.id, true);
      return {
        enabled: true,
        autoApplied: true,
        proposal: bestProposal.title,
        result: result
      };
    } catch (error) {
      return {
        enabled: true,
        autoApplied: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        proposal: bestProposal.title
      };
    }
  }

  // Manual approval for proposals
  static async approveProposal(proposalId: string): Promise<any> {
    const proposal = await prisma.investmentProposal.update({
      where: { id: proposalId },
      data: { status: 'APPROVED' }
    });

    await prisma.aILog.create({
      data: {
        type: 'INVESTMENT_PROPOSAL',
        summary: `Proposal approved: ${proposal.title}`,
        details: { proposal },
        agent: 'Admin',
        confidence: 1.0
      }
    });

    return proposal;
  }

  // Reject proposal
  static async rejectProposal(proposalId: string, reason: string = ''): Promise<any> {
    const proposal = await prisma.investmentProposal.update({
      where: { id: proposalId },
      data: { 
        status: 'REJECTED',
        result: { rejectionReason: reason, rejectedAt: new Date().toISOString() }
      }
    });

    await prisma.aILog.create({
      data: {
        type: 'INVESTMENT_PROPOSAL',
        summary: `Proposal rejected: ${proposal.title}`,
        details: { proposal, reason },
        agent: 'Admin',
        confidence: 1.0
      }
    });

    return proposal;
  }
}