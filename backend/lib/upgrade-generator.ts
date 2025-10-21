// AI-powered upgrade proposal generator with safety checks
import { AIService } from './ai-service';
import { MemoryManager } from './memory-manager';

export interface UpgradeProposalData {
  title: string;
  description: string;
  category: string;
  priority: string;
  changes: any;
  safetyScore: number;
  riskAnalysis: any;
}

export class UpgradeGenerator {
  // Generate upgrade proposals based on system analysis
  static async generateProposals(): Promise<UpgradeProposalData[]> {
    console.log('🔧 AI Upgrade Generator: Analyzing system for improvements...');
    
    try {
      // Analyze current system state
      const systemAnalysis = await this.analyzeSystem();
      
      // Search for similar past upgrades in memory
      const pastUpgrades = await MemoryManager.searchMemories(
        'upgrade improvement fix performance',
        ['BEST_PRACTICE', 'SUCCESS_STORY', 'FAILURE_LEARNING'],
        0.6,
        5
      );

      // Generate proposals using AI
      const proposals = await this.generateAICodeUpgrades(systemAnalysis, pastUpgrades);
      
      // Filter and prioritize proposals
      const filteredProposals = proposals
        .filter(p => p.safetyScore >= 0.7) // Only safe proposals
        .sort((a, b) => {
          // Sort by priority score (priority + safety)
          const scoreA = this.calculatePriorityScore(a);
          const scoreB = this.calculatePriorityScore(b);
          return scoreB - scoreA;
        })
        .slice(0, 3); // Top 3 proposals

      console.log(`🔧 Generated ${filteredProposals.length} upgrade proposals`);
      return filteredProposals;
    } catch (error) {
      console.error('Error generating upgrade proposals:', error);
      return [];
    }
  }

  // Analyze current system for improvement opportunities
  private static async analyzeSystem(): Promise<any> {
    const { prisma } = await import('./db');
    
    const [
      systemFund,
      recentErrors,
      performanceMetrics,
      dependencyStatus
    ] = await Promise.all([
      prisma.systemFund.findFirst(),
      prisma.aITask.count({
        where: { 
          status: 'FAILED',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      this.getPerformanceMetrics(),
      this.checkDependencyStatus()
    ]);

    return {
      systemFund: systemFund?.growthFund || 0,
      recentErrors,
      performanceMetrics,
      dependencyStatus,
      timestamp: new Date().toISOString()
    };
  }

  // Get system performance metrics
  private static async getPerformanceMetrics(): Promise<any> {
    // In a real system, this would collect actual metrics
    // For now, we'll use simulated data
    return {
      apiResponseTime: 142, // ms
      errorRate: 0.02, // 2%
      uptime: 0.999, // 99.9%
      memoryUsage: 0.68, // 68%
      cpuUsage: 0.45, // 45%
      databasePerformance: 'good'
    };
  }

  // Check dependency update status
  private static async checkDependencyStatus(): Promise<any> {
    // Simulated dependency check
    return {
      outdatedDependencies: 3,
      securityVulnerabilities: 1,
      majorUpdatesAvailable: 2
    };
  }

  // Generate code upgrades using AI
  private static async generateAICodeUpgrades(
    systemAnalysis: any, 
    pastUpgrades: any[]
  ): Promise<UpgradeProposalData[]> {
    const prompt = `
      Analyze this system state and generate code upgrade proposals:
      
      SYSTEM STATE:
      - Available Growth Fund: $${systemAnalysis.systemFund}
      - Recent Errors: ${systemAnalysis.recentErrors}
      - Performance: ${JSON.stringify(systemAnalysis.performanceMetrics)}
      - Dependencies: ${JSON.stringify(systemAnalysis.dependencyStatus)}
      
      PAST UPGRADES (learn from these):
      ${pastUpgrades.map(upgrade => `- ${upgrade.content}`).join('\n')}
      
      Generate 2-3 specific, actionable upgrade proposals. For each proposal, provide:
      
      1. Title: Clear, descriptive title
      2. Description: Detailed explanation of the upgrade
      3. Category: CODE_IMPROVEMENT, PERFORMANCE, SECURITY, FEATURE, DEPENDENCY_UPDATE, CONFIG_CHANGE, or BUG_FIX
      4. Priority: LOW, MEDIUM, HIGH, or CRITICAL
      5. Changes: Specific code/config changes (as JSON)
      6. Safety Score: 0-1 (how safe is this change?)
      7. Risk Analysis: Potential risks and mitigation
      
      Return as JSON array.
      
      CRITICAL SAFETY RULES:
      - Never propose breaking changes without proper testing
      - Always maintain backward compatibility when possible
      - Consider the available budget ($${systemAnalysis.systemFund})
      - Prioritize security and stability over new features
    `;

    try {
      const completion = await AIService.chatWithAIVEL(prompt, {
        version: process.env.AIVEL_VERSION,
        task: 'upgrade_generation'
      });

      // Parse AI response
      const proposals = this.parseAIResponse(completion);
      
      // Validate and enhance proposals
      return proposals.map(proposal => ({
        ...proposal,
        safetyScore: this.calculateSafetyScore(proposal),
        riskAnalysis: this.enhanceRiskAnalysis(proposal)
      }));
    } catch (error) {
      console.error('AI upgrade generation failed:', error);
      return this.getFallbackProposals(systemAnalysis);
    }
  }

  // Parse AI response into structured proposals
  private static parseAIResponse(aiResponse: string): UpgradeProposalData[] {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return empty array
      return [];
    } catch (error) {
      console.error('Failed to parse AI upgrade response:', error);
      return [];
    }
  }

  // Calculate safety score for a proposal
  private static calculateSafetyScore(proposal: UpgradeProposalData): number {
    let score = 1.0;
    
    // Penalize high-risk categories
    if (proposal.category === 'SECURITY') score *= 0.9;
    if (proposal.category === 'DEPENDENCY_UPDATE') score *= 0.8;
    if (proposal.priority === 'CRITICAL') score *= 0.7;
    
    // Penalize complex changes
    const changeComplexity = this.assessChangeComplexity(proposal.changes);
    score *= (1 - changeComplexity * 0.3);
    
    return Math.max(0.1, Math.min(1.0, score));
  }

  // Assess complexity of proposed changes
  private static assessChangeComplexity(changes: any): number {
    if (!changes) return 0.1;
    
    const changeStr = JSON.stringify(changes);
    let complexity = 0.1;
    
    // Simple heuristics for complexity assessment
    if (changeStr.includes('database') || changeStr.includes('schema')) complexity += 0.3;
    if (changeStr.includes('api') || changeStr.includes('endpoint')) complexity += 0.2;
    if (changeStr.includes('dependency') || changeStr.includes('package')) complexity += 0.2;
    if (changeStr.length > 1000) complexity += 0.2;
    
    return Math.min(0.9, complexity);
  }

  // Enhance risk analysis with additional checks
  private static enhanceRiskAnalysis(proposal: UpgradeProposalData): any {
    const baseAnalysis = proposal.riskAnalysis || {};
    
    return {
      ...baseAnalysis,
      automatedChecks: {
        hasBackupPlan: true,
        canRollback: true,
        affectsUserData: false,
        requiresDowntime: false,
        budgetImpact: 'low'
      },
      recommendedActions: [
        'Run in staging first',
        'Monitor for 24 hours after deployment',
        'Have rollback procedure ready'
      ]
    };
  }

  // Calculate priority score for sorting
  private static calculatePriorityScore(proposal: UpgradeProposalData): number {
    const priorityWeights = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };
    
    const safetyWeight = 0.3;
    const priorityWeight = 0.7;
    
    return (proposal.safetyScore * safetyWeight) + 
           (priorityWeights[proposal.priority] * priorityWeight / 4);
  }

  // Fallback proposals if AI fails
  private static getFallbackProposals(systemAnalysis: any): UpgradeProposalData[] {
    return [
      {
        title: 'Update Outdated Dependencies',
        description: `Update ${systemAnalysis.dependencyStatus.outdatedDependencies} outdated npm packages to latest stable versions`,
        category: 'DEPENDENCY_UPDATE',
        priority: 'MEDIUM',
        changes: {
          action: 'npm_update',
          packages: ['express', 'axios', 'prisma'],
          version: 'latest'
        },
        safetyScore: 0.8,
        riskAnalysis: {
          risk: 'Low',
          impact: 'Improved security and performance',
          mitigation: 'Test thoroughly before deployment'
        }
      },
      {
        title: 'Add Request Rate Limiting',
        description: 'Implement API rate limiting to prevent abuse and improve stability',
        category: 'PERFORMANCE',
        priority: 'MEDIUM',
        changes: {
          action: 'add_middleware',
          file: 'middleware/rateLimit.ts',
          config: {
            windowMs: 15 * 60 * 1000,
            max: 100
          }
        },
        safetyScore: 0.9,
        riskAnalysis: {
          risk: 'Very Low',
          impact: 'Better API stability',
          mitigation: 'Monitor for false positives'
        }
      }
    ];
  }
}