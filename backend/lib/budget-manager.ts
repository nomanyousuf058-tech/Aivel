// Monthly budget management system with spending controls
import { AuditLogger } from './audit-logger';
export class BudgetManager {
  private static prisma: any;

  // Initialize monthly budgets
  static async initializeMonthlyBudgets(): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const defaultBudgets = [
      {
        month: currentMonth,
        category: 'AI_API_COSTS',
        allocated: 500, // $500 for AI API costs
        limitType: 'HARD'
      },
      {
        month: currentMonth,
        category: 'INFRASTRUCTURE', 
        allocated: 200, // $200 for infrastructure
        limitType: 'SOFT'
      },
      {
        month: currentMonth,
        category: 'MARKETING',
        allocated: 300, // $300 for marketing
        limitType: 'SOFT'
      },
      {
        month: currentMonth,
        category: 'DEVELOPMENT',
        allocated: 400, // $400 for development
        limitType: 'SOFT'
      },
      {
        month: currentMonth,
        category: 'OPERATIONS',
        allocated: 100, // $100 for operations
        limitType: 'HARD'
      }
    ];

    for (const budget of defaultBudgets) {
      await this.prisma.monthlyBudget.upsert({
        where: {
          month_category: {
            month: budget.month,
            category: budget.category
          }
        },
        update: {},
        create: budget
      });
    }

    console.log('💰 Monthly budgets initialized');
  }

  // Record a spending transaction
  static async recordSpending(category: string, amount: number, description: string, context?: any): Promise<{
    allowed: boolean;
    newBalance: number;
    budget: any;
  }> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const budget = await this.prisma.monthlyBudget.findUnique({
      where: {
        month_category: {
          month: currentMonth,
          category: category
        }
      }
    });

    if (!budget) {
      throw new Error(`No budget configured for category: ${category}`);
    }

    const newSpent = budget.spent + amount;
    const withinBudget = newSpent <= budget.allocated;
    const allowed = withinBudget || budget.limitType === 'SOFT';

    // Update budget
    const updatedBudget = await this.prisma.monthlyBudget.update({
      where: { id: budget.id },
      data: { spent: newSpent }
    });

    // Log the transaction
    await AuditLogger.logBudgetActivity(category, amount, 'SPENDING', {
      description,
      oldBalance: budget.spent,
      newBalance: newSpent,
      allocated: budget.allocated,
      withinBudget,
      allowed
    });

    // Trigger alert if approaching or exceeding budget
    if (newSpent > budget.allocated * 0.8) { // 80% threshold
      await this.triggerBudgetAlert(updatedBudget, amount, context);
    }

    return {
      allowed,
      newBalance: newSpent,
      budget: updatedBudget
    };
  }

  // Trigger budget alert
  private static async triggerBudgetAlert(budget: any, amount: number, context: any): Promise<void> {
    const { prisma } = await import('./db');
    
    const severity = budget.spent > budget.allocated ? 'HIGH' : 'MEDIUM';
    const message = budget.spent > budget.allocated ?
      `Budget exceeded for ${budget.category}. Spent: $${budget.spent}, Allocated: $${budget.allocated}` :
      `Budget warning for ${budget.category}. Spent: $${budget.spent} (${((budget.spent / budget.allocated) * 100).toFixed(1)}% of $${budget.allocated})`;

    await prisma.systemAlert.create({
      data: {
        type: 'BUDGET_EXCEEDED',
        title: `Budget ${budget.spent > budget.allocated ? 'Exceeded' : 'Warning'} - ${budget.category}`,
        message: message,
        severity: severity,
        data: {
          budgetId: budget.id,
          category: budget.category,
          spent: budget.spent,
          allocated: budget.allocated,
          amount: amount,
          context: context
        },
        source: 'BudgetManager'
      }
    });

    console.warn(`💰 ${message}`);
  }

  // Get budget status
  static async getBudgetStatus(month?: Date): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const targetMonth = month || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const budgets = await this.prisma.monthlyBudget.findMany({
      where: { month: targetMonth }
    });

    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const utilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    const alerts = await this.prisma.systemAlert.findMany({
      where: { 
        type: 'BUDGET_EXCEEDED',
        createdAt: { gte: targetMonth }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return {
      month: targetMonth,
      summary: {
        totalAllocated,
        totalSpent,
        remaining: totalAllocated - totalSpent,
        utilization: Math.round(utilization)
      },
      budgets: budgets.map(budget => ({
        ...budget,
        utilization: Math.round((budget.spent / budget.allocated) * 100),
        status: budget.spent > budget.allocated ? 'EXCEEDED' : 
                budget.spent > budget.allocated * 0.8 ? 'WARNING' : 'HEALTHY'
      })),
      recentAlerts: alerts
    };
  }

  // Update budget allocation
  static async updateBudget(category: string, allocated: number, limitType: string = 'SOFT'): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const budget = await this.prisma.monthlyBudget.upsert({
      where: {
        month_category: {
          month: currentMonth,
          category: category
        }
      },
      update: {
        allocated: allocated,
        limitType: limitType
      },
      create: {
        month: currentMonth,
        category: category,
        allocated: allocated,
        limitType: limitType
      }
    });

    await AuditLogger.logConfigChange('system', `budget_${category}`, {}, {
      allocated: allocated,
      limitType: limitType
    });

    return budget;
  }

  // Get spending recommendations
  static async getSpendingRecommendations(): Promise<string[]> {
    const budgetStatus = await this.getBudgetStatus();
    const recommendations: string[] = [];

    for (const budget of budgetStatus.budgets) {
      if (budget.utilization > 90) {
        recommendations.push(
          `🚨 ${budget.category} budget almost exhausted (${budget.utilization}% used). Consider increasing allocation.`
        );
      } else if (budget.utilization < 20) {
        recommendations.push(
          `💡 ${budget.category} budget underutilized (${budget.utilization}% used). Consider reallocating funds.`
        );
      }
    }

    if (budgetStatus.summary.utilization > 80) {
      recommendations.push(
        `📊 Overall budget utilization high (${budgetStatus.summary.utilization}%). Monitor spending closely.`
      );
    }

    return recommendations;
  }
}