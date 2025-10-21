import { prisma } from './db';
import { AIService } from './ai-service';

export class AIScheduler {
  static async analyzeAllProjects() {
    const projects = await prisma.project.findMany({
      where: {
        lastAICheck: {
          lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
        }
      }
    });

    let issuesFixed = 0;
    let projectsAnalyzed = 0;

    for (const project of projects) {
      try {
        const analysis = await AIService.analyzeProject(project);
        
        await prisma.project.update({
          where: { id: project.id },
          data: {
            status: analysis.status,
            aiLogs: analysis,
            lastAICheck: new Date()
          }
        });

        projectsAnalyzed++;
        if (analysis.issues && analysis.issues.length > 0) {
          issuesFixed++;
        }
      } catch (error) {
        console.error(`Error analyzing project ${project.id}:`, error);
      }
    }

    // Log the analysis session
    await prisma.aILog.create({
      data: {
        type: 'PROJECT_ANALYSIS',
        summary: `Weekly project analysis completed`,
        details: { projectsAnalyzed, issuesFound: issuesFixed },
        projectsAnalyzed,
        issuesFixed
      }
    });

    return { projectsAnalyzed, issuesFixed };
  }

  static async generateWeeklyReport() {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [
      newUsers,
      newProjects,
      newRevenue,
      newContent,
      aiActivity
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.project.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.revenue.aggregate({
        where: { createdAt: { gte: lastWeek } },
        _sum: { amount: true }
      }),
      prisma.content.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.aILog.findMany({
        where: { createdAt: { gte: lastWeek } }
      })
    ]);

    const report = {
      period: 'weekly',
      newUsers,
      newProjects,
      revenueGenerated: newRevenue._sum.amount || 0,
      newContent,
      aiTasksCompleted: aiActivity.length,
      growthFund: (newRevenue._sum.amount || 0) * 0.3,
      ownerRevenue: (newRevenue._sum.amount || 0) * 0.7
    };

    await prisma.aILog.create({
      data: {
        type: 'REVENUE_REPORT',
        summary: `Weekly report: $${report.revenueGenerated} revenue generated`,
        details: report,
        projectsAnalyzed: 0,
        issuesFixed: 0,
        revenueGenerated: report.revenueGenerated
      }
    });

    return report;
  }

  static async makeGrowthDecision() {
    const systemFund = await prisma.systemFund.findFirst();
    
    if (!systemFund || systemFund.growthFund < 1000) {
      return { decision: 'INSUFFICIENT_FUNDS', amount: systemFund?.growthFund };
    }

    // AI decides where to invest growth fund
    const decisions = [
      { action: 'API_UPGRADE', cost: 500, impact: 'HIGH' },
      { action: 'MARKETING_BOOST', cost: 800, impact: 'MEDIUM' },
      { action: 'NEW_TOOL_DEVELOPMENT', cost: 1200, impact: 'HIGH' },
      { action: 'INFRASTRUCTURE', cost: 600, impact: 'MEDIUM' }
    ];

    // Simple decision logic - choose highest impact within budget
    const affordableDecisions = decisions.filter(d => d.cost <= systemFund.growthFund);
    const decision = affordableDecisions.sort((a, b) => {
      if (a.impact === b.impact) return b.cost - a.cost;
      return a.impact === 'HIGH' ? -1 : 1;
    })[0];

    if (decision) {
      // Deduct from growth fund
      await prisma.systemFund.update({
        where: { id: systemFund.id },
        data: {
          growthFund: { decrement: decision.cost }
        }
      });

      await prisma.aILog.create({
        data: {
          type: 'GROWTH_DECISION',
          summary: `Growth investment: ${decision.action} ($${decision.cost})`,
          details: decision,
          projectsAnalyzed: 0,
          issuesFixed: 0
        }
      });

      return { decision: decision.action, cost: decision.cost, remaining: systemFund.growthFund - decision.cost };
    }

    return { decision: 'NO_VALID_INVESTMENT', amount: systemFund.growthFund };
  }
}