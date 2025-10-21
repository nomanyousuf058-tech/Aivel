// AI-powered experiment suggestion system
import { AIService } from './ai-service';
import { MemoryManager } from './memory-manager';

export class ExperimentSuggestor {
  // Generate experiment suggestions based on system analysis
  static async generateSuggestions(): Promise<any[]> {
    console.log('💡 Generating experiment suggestions...');
    
    try {
      // Analyze current system state
      const systemState = await this.analyzeSystemForExperiments();
      
      // Search for past experiment learnings
      const pastLearnings = await MemoryManager.searchMemories(
        'experiment test learning success failure',
        ['SUCCESS_STORY', 'FAILURE_LEARNING', 'BEST_PRACTICE'],
        0.6,
        5
      );

      // Generate suggestions using AI
      const suggestions = await this.generateAISuggestions(systemState, pastLearnings);
      
      // Filter and prioritize suggestions
      const filteredSuggestions = suggestions
        .filter(s => s.expectedImpact >= 0.3) // Only meaningful impact
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 5); // Top 5 suggestions

      console.log(`💡 Generated ${filteredSuggestions.length} experiment suggestions`);
      return filteredSuggestions;
    } catch (error) {
      console.error('Error generating experiment suggestions:', error);
      return this.getFallbackSuggestions();
    }
  }

  // Analyze system for experiment opportunities
  private static async analyzeSystemForExperiments(): Promise<any> {
    const { prisma } = await import('./db');
    
    const [
      userMetrics,
      revenueMetrics,
      performanceMetrics,
      currentExperiments
    ] = await Promise.all([
      this.getUserMetrics(),
      this.getRevenueMetrics(),
      this.getPerformanceMetrics(),
      prisma.experiment.count({ where: { status: 'RUNNING' } })
    ]);

    return {
      userMetrics,
      revenueMetrics,
      performanceMetrics,
      currentExperiments,
      systemAreas: this.identifyOpportunityAreas(userMetrics, revenueMetrics, performanceMetrics)
    };
  }

  // Get user metrics for analysis
  private static async getUserMetrics(): Promise<any> {
    const { prisma } = await import('./db');
    
    const [
      totalUsers,
      newUsersThisWeek,
      activeUsers,
      userRetention
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.user.count({
        where: {
          updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      // Simplified retention calculation
      0.65 // Mock retention rate
    ]);

    return {
      totalUsers,
      newUsersThisWeek,
      activeUsers,
      userRetention,
      activationRate: newUsersThisWeek > 0 ? (activeUsers / newUsersThisWeek) : 0
    };
  }

  // Get revenue metrics
  private static async getRevenueMetrics(): Promise<any> {
    const { prisma } = await import('./db');
    
    const weeklyRevenue = await prisma.revenue.aggregate({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      _sum: { amount: true },
      _avg: { amount: true }
    });

    return {
      weeklyRevenue: weeklyRevenue._sum.amount || 0,
      averageTransaction: weeklyRevenue._avg.amount || 0,
      revenuePerUser: 0 // Would need user-revenue mapping
    };
  }

  // Get performance metrics
  private static async getPerformanceMetrics(): Promise<any> {
    // Mock performance metrics - in real system, collect from monitoring
    return {
      apiResponseTime: 142,
      pageLoadTime: 2.1,
      errorRate: 0.02,
      uptime: 0.999
    };
  }

  // Identify opportunity areas for experiments
  private static identifyOpportunityAreas(userMetrics: any, revenueMetrics: any, performanceMetrics: any): string[] {
    const areas = [];

    if (userMetrics.activationRate < 0.5) {
      areas.push('user_activation');
    }

    if (userMetrics.userRetention < 0.7) {
      areas.push('user_retention');
    }

    if (revenueMetrics.weeklyRevenue < 1000) {
      areas.push('revenue_optimization');
    }

    if (performanceMetrics.pageLoadTime > 2.0) {
      areas.push('performance_optimization');
    }

    if (userMetrics.newUsersThisWeek < 10) {
      areas.push('user_acquisition');
    }

    return areas;
  }

  // Generate AI-powered experiment suggestions
  private static async generateAISuggestions(systemState: any, pastLearnings: any[]): Promise<any[]> {
    const prompt = `
      Analyze this system state and generate experiment suggestions:
      
      SYSTEM STATE:
      - Users: ${systemState.userMetrics.totalUsers} total, ${systemState.userMetrics.newUsersThisWeek} new this week
      - Activation Rate: ${(systemState.userMetrics.activationRate * 100).toFixed(1)}%
      - Retention: ${(systemState.userMetrics.userRetention * 100).toFixed(1)}%
      - Weekly Revenue: $${systemState.revenueMetrics.weeklyRevenue}
      - Performance: ${JSON.stringify(systemState.performanceMetrics)}
      - Opportunity Areas: ${systemState.systemAreas.join(', ')}
      - Current Running Experiments: ${systemState.currentExperiments}
      
      PAST LEARNINGS:
      ${pastLearnings.map(learning => `- ${learning.content}`).join('\n')}
      
      Generate 3-5 specific, actionable experiment suggestions. For each suggestion, provide:
      
      1. Title: Clear, descriptive title
      2. Hypothesis: What we expect to happen
      3. Category: UI_UX, PERFORMANCE, FEATURE, PRICING, CONTENT, MARKETING, or ONBOARDING
      4. Variants: Array of variant configurations (include a control)
      5. Primary Metric: What to measure
      6. Expected Impact: 0-1 scale (how much improvement expected)
      7. Estimated Duration: Days to run
      8. Priority Score: 0-100 (based on impact vs effort)
      9. Risk Level: LOW, MEDIUM, HIGH
      
      Return as JSON array.
      
      Focus on:
      - High-impact, low-risk experiments first
      - Clear, measurable hypotheses
      - Practical implementations
      - Learning opportunities
    `;

    try {
      const completion = await AIService.chatWithAIVEL(prompt, {
        version: process.env.AIVEL_VERSION,
        task: 'experiment_suggestion'
      });

      return this.parseAISuggestions(completion);
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      return this.getFallbackSuggestions();
    }
  }

  // Parse AI response into structured suggestions
  private static parseAISuggestions(aiResponse: string): any[] {
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('Failed to parse AI suggestions:', error);
      return [];
    }
  }

  // Fallback suggestions if AI fails
  private static getFallbackSuggestions(): any[] {
    return [
      {
        title: 'Simplify User Onboarding Flow',
        hypothesis: 'Reducing the number of steps in onboarding will increase user activation rate',
        category: 'ONBOARDING',
        variants: [
          { name: 'control', config: { steps: 5 } },
          { name: 'simplified', config: { steps: 3 } }
        ],
        primaryMetric: 'activation_rate',
        expectedImpact: 0.4,
        estimatedDuration: 14,
        priorityScore: 85,
        riskLevel: 'LOW'
      },
      {
        title: 'Pricing Page Redesign',
        hypothesis: 'A clearer pricing page will increase conversion to paid plans',
        category: 'UI_UX',
        variants: [
          { name: 'control', config: { design: 'current' } },
          { name: 'redesigned', config: { design: 'simplified', highlights: ['value_prop'] } }
        ],
        primaryMetric: 'conversion_rate',
        expectedImpact: 0.3,
        estimatedDuration: 21,
        priorityScore: 75,
        riskLevel: 'MEDIUM'
      },
      {
        title: 'Personalized Content Recommendations',
        hypothesis: 'Showing personalized content will increase user engagement and retention',
        category: 'CONTENT',
        variants: [
          { name: 'control', config: { personalization: false } },
          { name: 'personalized', config: { personalization: true, algorithm: 'collaborative' } }
        ],
        primaryMetric: 'user_retention',
        expectedImpact: 0.25,
        estimatedDuration: 28,
        priorityScore: 70,
        riskLevel: 'MEDIUM'
      }
    ];
  }
}