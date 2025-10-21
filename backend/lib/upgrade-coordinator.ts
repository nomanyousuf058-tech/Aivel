// Add to existing UpgradeCoordinator class

import { DeploymentManager } from './deployment-manager';
import { ExperimentManager } from './experiment-manager';
import { SystemConfig } from './system-config';

export class UpgradeCoordinator {
  // Minimal methods referenced by API routes
  static async runAutoUpgradeCycle(): Promise<{ success: boolean; message: string }> {
    // Placeholder orchestration; integrate real workflow as needed
    await new Promise(r => setTimeout(r, 10));
    return { success: true, message: 'Auto-upgrade cycle triggered' };
  }

  static async getPipelineStatus(): Promise<{ stage: string; healthy: boolean }> {
    // Placeholder pipeline status; integrate with deployment state
    return { stage: 'IDLE', healthy: true };
  }

  // Enhanced deployUpgrade method with experiment capability
  static async deployUpgradeWithExperiment(proposalId: string): Promise<any> {
    const { prisma } = await import('./db');
    
    const proposal = await prisma.upgradeProposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      throw new Error('Upgrade proposal not found');
    }

    // Check if this upgrade should be tested with an experiment
    const shouldExperiment = await this.shouldUseExperiment(proposal);
    
    if (shouldExperiment) {
      console.log(`🔬 Deploying upgrade as experiment: ${proposal.title}`);
      return await this.deployAsExperiment(proposal);
    } else {
      console.log(`🚀 Deploying upgrade directly: ${proposal.title}`);
      return await DeploymentManager.deployUpgrade(proposalId, 'STAGING');
    }
  }

  // Determine if an upgrade should use experimentation
  private static async shouldUseExperiment(proposal: any): Promise<boolean> {
    // Use experiments for:
    // - Feature upgrades
    // - UI/UX changes  
    // - Changes that might affect user behavior
    // - Medium/high risk changes
    
    const experimentCategories = ['FEATURE', 'UI_UX', 'CONTENT', 'ONBOARDING'];
    const shouldExperiment = 
      experimentCategories.includes(proposal.category) &&
      proposal.safetyScore < 0.9 &&
      proposal.priority === 'HIGH';

    // Check system configuration
    const autoExperimentConfig = await SystemConfig.get('auto_experiment_enabled');
    
    return shouldExperiment && autoExperimentConfig === 'true';
  }

  // Deploy an upgrade as an experiment
  private static async deployAsExperiment(proposal: any): Promise<any> {
    const { prisma } = await import('./db');
    
    // Create experiment configuration
    const experimentConfig = {
      name: `Upgrade: ${proposal.title}`,
      description: `Test deployment of upgrade: ${proposal.description}`,
      hypothesis: `This upgrade will improve ${this.getHypothesisForCategory(proposal.category)}`,
      category: this.mapToExperimentCategory(proposal.category),
      variants: [
        { 
          name: 'control', 
          config: { upgrade: false },
          allocation: 0.5
        },
        { 
          name: 'upgrade', 
          config: { 
            upgrade: true,
            changes: proposal.changes
          },
          allocation: 0.5
        }
      ],
      primaryMetric: this.getPrimaryMetricForCategory(proposal.category),
      secondaryMetrics: ['user_engagement', 'error_rate', 'performance'],
      estimatedDuration: 14, // 2 weeks
      successThreshold: 0.1 // 10% improvement
    };

    // Create and start the experiment
    const experimentId = await ExperimentManager.createExperiment(experimentConfig);
    await ExperimentManager.startExperiment(experimentId);

    // Deploy both variants
    const deploymentResult = await DeploymentManager.deployUpgrade(proposal.id, 'STAGING');
    
    // Update proposal with experiment info
    await prisma.upgradeProposal.update({
      where: { id: proposal.id },
      data: {
        status: 'TESTING',
        deployResults: {
          ...deploymentResult,
          experimentId,
          deployedAsExperiment: true
        }
      }
    });

    return {
      success: true,
      deployedAsExperiment: true,
      experimentId,
      deploymentResult,
      message: `Upgrade deployed as experiment. Tracking with experiment ID: ${experimentId}`
    };
  }

  // Map upgrade category to experiment category
  private static mapToExperimentCategory(upgradeCategory: string): string {
    const mapping: { [key: string]: string } = {
      'FEATURE': 'FEATURE',
      'UI_UX': 'UI_UX', 
      'CONTENT': 'CONTENT',
      'PERFORMANCE': 'PERFORMANCE',
      'BUG_FIX': 'UI_UX',
      'DEPENDENCY_UPDATE': 'PERFORMANCE',
      'CONFIG_CHANGE': 'FEATURE'
    };
    
    return mapping[upgradeCategory] || 'FEATURE';
  }

  // Get hypothesis based on upgrade category
  private static getHypothesisForCategory(category: string): string {
    const hypotheses: { [key: string]: string } = {
      'FEATURE': 'user engagement and satisfaction',
      'UI_UX': 'user experience and conversion rates',
      'CONTENT': 'content engagement and retention',
      'PERFORMANCE': 'system performance and user satisfaction',
      'BUG_FIX': 'system stability and user trust',
      'DEPENDENCY_UPDATE': 'system reliability and performance'
    };
    
    return hypotheses[category] || 'system metrics';
  }

  // Get primary metric based on category
  private static getPrimaryMetricForCategory(category: string): string {
    const metrics: { [key: string]: string } = {
      'FEATURE': 'user_engagement',
      'UI_UX': 'conversion_rate',
      'CONTENT': 'content_engagement',
      'PERFORMANCE': 'performance_score',
      'BUG_FIX': 'error_rate',
      'DEPENDENCY_UPDATE': 'system_stability'
    };
    
    return metrics[category] || 'user_engagement';
  }

  // Analyze experiment results for upgrades
  static async analyzeUpgradeExperiments(): Promise<any> {
    const { prisma } = await import('./db');
    
    // Find upgrades that were deployed as experiments
    const experimentUpgrades = await prisma.upgradeProposal.findMany({
      where: {
        status: 'TESTING',
        deployResults: { path: ['deployedAsExperiment'], equals: true }
      },
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const results: any[] = [];

    for (const upgrade of experimentUpgrades) {
      const experimentId = (upgrade.deployResults as any)?.experimentId;
      
      if (experimentId) {
        try {
          const experimentResult = await ExperimentManager.analyzeExperiment(experimentId);
          
          if ((experimentResult as any).statisticalSignificance.winner === 'upgrade') {
            // Upgrade is successful - deploy to all users
            await DeploymentManager.deployUpgrade(upgrade.id, 'PRODUCTION');
            await prisma.upgradeProposal.update({
              where: { id: upgrade.id },
              data: { status: 'DEPLOYED' }
            });
            
            results.push({
              upgrade: upgrade.title,
              status: 'SUCCESS',
              improvement: (experimentResult as any).statisticalSignificance.improvement,
              confidence: (experimentResult as any).statisticalSignificance.confidence
            });
          } else {
            // Upgrade didn't show improvement - rollback
            await DeploymentManager.rollbackUpgrade(upgrade.id, 'Experiment showed no significant improvement');
            
            results.push({
              upgrade: upgrade.title,
              status: 'FAILED',
              reason: 'No significant improvement in experiment'
            });
          }
        } catch (error: any) {
          results.push({
            upgrade: upgrade.title,
            status: 'ERROR',
            error: error.message
          });
        }
      }
    }

    return {
      analyzed: experimentUpgrades.length,
      results
    };
  }
}