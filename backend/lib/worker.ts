// Background worker for AI automation tasks
import { prisma } from './db';
import { InvestmentManager } from './investment-manager';

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class AIWorker {
  // Process a single task
  static async processTask(taskName: string): Promise<TaskResult> {
    console.log(`🤖 AI Worker: Starting task "${taskName}"`);
    
    try {
      // Create task record
      const task = await prisma.aITask.create({
        data: {
          name: taskName,
          status: 'RUNNING',
          startedAt: new Date(),
        }
      });

      let result: TaskResult;

      // Route to appropriate task handler
      switch (taskName) {
        case 'daily-scan':
          result = await this.runDailyScan();
          break;
        case 'weekly-analysis':
          result = await this.runWeeklyAnalysis();
          break;
        case 'investment-review':
          result = await this.runInvestmentReview();
          break;
        case 'safety-check':
          result = await this.runSafetyCheck();
          break;
        default:
          throw new Error(`Unknown task: ${taskName}`);
      }

      // Update task record with result
      await prisma.aITask.update({
        where: { id: task.id },
        data: {
          status: result.success ? 'COMPLETED' : 'FAILED',
          completedAt: new Date(),
          result: result.data,
          error: result.error,
        }
      });

      // Log the task execution
      await prisma.aILog.create({
        data: {
          type: 'TASK_EXECUTION',
          summary: `Task ${taskName} ${result.success ? 'completed' : 'failed'}`,
          details: result,
          agent: 'AIWorker',
          confidence: result.success ? 1.0 : 0.0,
        }
      });

      console.log(`🤖 AI Worker: Task "${taskName}" ${result.success ? 'completed' : 'failed'}`);
      return result;

    } catch (error: any) {
      console.error(`🤖 AI Worker: Task "${taskName}" error:`, error);
      
      await prisma.aILog.create({
        data: {
          type: 'TASK_EXECUTION',
          summary: `Task ${taskName} failed with error`,
          details: { error: error.message },
          agent: 'AIWorker',
          confidence: 0.0,
        }
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Daily scan: Check project health and system status
  private static async runDailyScan(): Promise<TaskResult> {
    try {
      const projects = await prisma.project.findMany();
      let criticalIssues = 0;
      let minorIssues = 0;

      // Simple health check (in real system, this would call monitoring APIs)
      for (const project of projects) {
        const metrics = project.metrics as any;
        if (metrics?.errorRate > 0.1) {
          criticalIssues++;
        } else if (metrics?.errorRate > 0.05) {
          minorIssues++;
        }
      }

      const result = {
        projectsScanned: projects.length,
        criticalIssues,
        minorIssues,
        timestamp: new Date().toISOString()
      };

      await prisma.aILog.create({
        data: {
          type: 'PROJECT_ANALYSIS',
          summary: `Daily scan: ${projects.length} projects, ${criticalIssues} critical, ${minorIssues} minor issues`,
          details: result,
          agent: 'DailyScanner',
          projectsAnalyzed: projects.length,
          issuesFixed: 0,
        }
      });

      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Weekly analysis: Comprehensive system review
  private static async runWeeklyAnalysis(): Promise<TaskResult> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const [
        newUsers,
        newProjects,
        weeklyRevenue,
        aiActivity
      ] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        prisma.project.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        prisma.revenue.aggregate({
          where: { createdAt: { gte: oneWeekAgo } },
          _sum: { amount: true }
        }),
        prisma.aILog.count({ where: { createdAt: { gte: oneWeekAgo } } })
      ]);

      const result = {
        period: 'weekly',
        newUsers,
        newProjects,
        revenue: weeklyRevenue._sum.amount || 0,
        aiActivities: aiActivity,
        growthFundAddition: (weeklyRevenue._sum.amount || 0) * 0.3,
        timestamp: new Date().toISOString()
      };

      await prisma.aILog.create({
        data: {
          type: 'REVENUE_REPORT',
          summary: `Weekly analysis: $${result.revenue} revenue, ${result.newUsers} new users`,
          details: result,
          agent: 'WeeklyAnalyzer',
          revenueGenerated: result.revenue,
        }
      });

      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Investment review: Check growth fund and propose investments
  private static async runInvestmentReview(): Promise<TaskResult> {
    try {
      const systemFund = await prisma.systemFund.findFirst();
      if (!systemFund) {
        return { success: false, error: 'System fund not found' };
      }

      // Only propose investments if we have sufficient funds
      if (systemFund.growthFund >= 100) { // Minimum PKR 100 for any investment
        const investmentResult = await InvestmentManager.proposeInvestment();
        return { success: true, data: investmentResult };
      }

      return { 
        success: true, 
        data: { 
          message: 'Insufficient funds for investment proposals',
          availableFunds: systemFund.growthFund 
        } 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // System safety check
  private static async runSafetyCheck(): Promise<TaskResult> {
    try {
      const systemFund = await prisma.systemFund.findFirst();
      const recentErrors = await prisma.aITask.count({
        where: { 
          status: 'FAILED',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      });

      const result = {
        systemStable: recentErrors === 0,
        recentErrors,
        ownerBalance: systemFund?.ownerBalance || 0,
        growthFund: systemFund?.growthFund || 0,
        autoInvestEnabled: systemFund?.autoInvest || false,
        timestamp: new Date().toISOString()
      };

      await prisma.aILog.create({
        data: {
          type: 'SAFETY_CHECK',
          summary: `Safety check: ${result.systemStable ? 'System stable' : 'Issues detected'}`,
          details: result,
          agent: 'SafetyAgent',
          confidence: result.systemStable ? 0.9 : 0.3,
        }
      });

      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}