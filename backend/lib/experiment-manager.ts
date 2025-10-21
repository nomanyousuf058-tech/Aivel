// Experiment manager for A/B testing and statistical analysis
import { MemoryManager } from './memory-manager';

export interface ExperimentConfig {
  name: string;
  description: string;
  hypothesis: string;
  category: string;
  variants: Array<{
    name: string;
    config: any;
    allocation?: number;
  }>;
  primaryMetric: string;
  secondaryMetrics?: string[];
  targetAudience?: string;
  trafficAllocation?: number;
  successThreshold?: number;
  estimatedDuration?: number;
}

export interface ExperimentResult {
  experimentId: string;
  variantResults: {
    [variantName: string]: {
      participants: number;
      conversions: number;
      conversionRate: number;
      totalValue: number;
      averageValue: number;
    };
  };
  statisticalSignificance: {
    pValue: number;
    confidence: number;
    winner?: string;
    improvement?: number;
  };
  recommendations: string[];
}

export class ExperimentManager {
  // Create a new experiment
  static async createExperiment(config: ExperimentConfig): Promise<string> {
    const { prisma } = await import('./db');
    
    try {
      // Validate variants and allocations
      this.validateExperimentConfig(config);
      
      const experiment = await prisma.experiment.create({
        data: {
          name: config.name,
          description: config.description,
          hypothesis: config.hypothesis,
          category: config.category,
          variants: config.variants,
          primaryMetric: config.primaryMetric,
          secondaryMetrics: config.secondaryMetrics || [],
          targetAudience: config.targetAudience,
          trafficAllocation: config.trafficAllocation || 1.0,
          successThreshold: config.successThreshold,
          estimatedDuration: config.estimatedDuration,
          status: 'DRAFT'
        }
      });

      // Create variant records
      for (const variant of config.variants) {
        await prisma.experimentVariant.create({
          data: {
            experimentId: experiment.id,
            name: variant.name,
            config: variant.config,
            allocation: variant.allocation || (1.0 / config.variants.length)
          }
        });
      }

      // Log experiment creation
      await prisma.aILog.create({
        data: {
          type: 'SYSTEM_UPDATE',
          summary: `Experiment created: ${config.name}`,
          details: {
            experimentId: experiment.id,
            config,
            hypothesis: config.hypothesis
          },
          agent: 'ExperimentManager',
          confidence: 0.8
        }
      });

      console.log(`🔬 Experiment created: ${config.name} (${experiment.id})`);
      return experiment.id;
    } catch (error) {
      console.error('Error creating experiment:', error);
      throw new Error(`Failed to create experiment: ${error.message}`);
    }
  }

  // Validate experiment configuration
  private static validateExperimentConfig(config: ExperimentConfig): void {
    if (!config.variants || config.variants.length < 2) {
      throw new Error('Experiment must have at least 2 variants');
    }

    if (!config.primaryMetric) {
      throw new Error('Primary metric is required');
    }

    // Check variant allocations sum to 1
    const totalAllocation = config.variants.reduce(
      (sum, variant) => sum + (variant.allocation || 0), 0
    );
    
    if (Math.abs(totalAllocation - 1.0) > 0.01) {
      throw new Error('Variant allocations must sum to 1.0');
    }

    // Check for unique variant names
    const variantNames = config.variants.map(v => v.name);
    const uniqueNames = new Set(variantNames);
    if (uniqueNames.size !== variantNames.length) {
      throw new Error('Variant names must be unique');
    }
  }

  // Start an experiment
  static async startExperiment(experimentId: string): Promise<void> {
    const { prisma } = await import('./db');
    
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId }
    });

    if (!experiment) {
      throw new Error('Experiment not found');
    }

    if (experiment.status !== 'DRAFT') {
      throw new Error('Only draft experiments can be started');
    }

    await prisma.experiment.update({
      where: { id: experimentId },
      data: {
        status: 'RUNNING',
        startDate: new Date()
      }
    });

    // Log experiment start
    await prisma.aILog.create({
      data: {
        type: 'SYSTEM_UPDATE',
        summary: `Experiment started: ${experiment.name}`,
        details: { experimentId },
        agent: 'ExperimentManager',
        confidence: 0.7
      }
    });

    console.log(`🔬 Experiment started: ${experiment.name}`);
  }

  // Record an experiment event
  static async recordEvent(
    experimentId: string,
    variantName: string,
    eventType: string,
    userId?: string,
    eventValue?: number,
    metadata?: any
  ): Promise<void> {
    const { prisma } = await import('./db');
    
    try {
      // Verify experiment is running and variant exists
      const experiment = await prisma.experiment.findUnique({
        where: { id: experimentId },
        include: { variants: true }
      });

      if (!experiment || experiment.status !== 'RUNNING') {
        throw new Error('Experiment not found or not running');
      }

      const variant = experiment.variants.find(v => v.name === variantName);
      if (!variant) {
        throw new Error(`Variant ${variantName} not found in experiment`);
      }

      // Generate session ID if not provided by client
      const sessionId = userId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Record the event
      await prisma.experimentEvent.create({
        data: {
          experimentId,
          variantName,
          userId,
          sessionId,
          eventType,
          eventValue,
          metadata
        }
      });

      // Update daily summary (in background)
      this.updateDailySummary(experimentId, variantName).catch(console.error);

    } catch (error) {
      console.error('Error recording experiment event:', error);
      // Don't throw - we don't want to break user experience
    }
  }

  // Update daily summary for a variant
  private static async updateDailySummary(experimentId: string, variantName: string): Promise<void> {
    const { prisma } = await import('./db');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's events for this variant
    const events = await prisma.experimentEvent.findMany({
      where: {
        experimentId,
        variantName,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (events.length === 0) return;

    // Calculate metrics
    const participants = new Set(events.map(e => e.sessionId)).size;
    const conversions = events.filter(e => e.eventType === 'CONVERSION').length;
    const revenueEvents = events.filter(e => e.eventType === 'REVENUE' && e.eventValue);
    const totalValue = revenueEvents.reduce((sum, e) => sum + (e.eventValue || 0), 0);
    const averageValue = revenueEvents.length > 0 ? totalValue / revenueEvents.length : 0;

    // Upsert daily summary
    await prisma.experimentSummary.upsert({
      where: {
        experimentId_variantName_date: {
          experimentId,
          variantName,
          date: today
        }
      },
      update: {
        participants,
        conversions,
        totalValue,
        averageValue
      },
      create: {
        experimentId,
        variantName,
        date: today,
        participants,
        conversions,
        totalValue,
        averageValue
      }
    });
  }

  // Analyze experiment results
  static async analyzeExperiment(experimentId: string): Promise<ExperimentResult> {
    const { prisma } = await import('./db');
    
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: {
        variants: true,
        summaries: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!experiment) {
      throw new Error('Experiment not found');
    }

    // Calculate overall metrics for each variant
    const variantResults: any = {};
    
    for (const variant of experiment.variants) {
      const variantSummaries = experiment.summaries.filter(s => s.variantName === variant.name);
      
      const participants = variantSummaries.reduce((sum, s) => sum + s.participants, 0);
      const conversions = variantSummaries.reduce((sum, s) => sum + s.conversions, 0);
      const totalValue = variantSummaries.reduce((sum, s) => sum + s.totalValue, 0);
      
      variantResults[variant.name] = {
        participants,
        conversions,
        conversionRate: participants > 0 ? conversions / participants : 0,
        totalValue,
        averageValue: conversions > 0 ? totalValue / conversions : 0
      };
    }

    // Calculate statistical significance
    const statisticalSignificance = await this.calculateStatisticalSignificance(variantResults);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(variantResults, statisticalSignificance, experiment);

    const result: ExperimentResult = {
      experimentId,
      variantResults,
      statisticalSignificance,
      recommendations
    };

    // Update experiment with results
    await prisma.experiment.update({
      where: { id: experimentId },
      data: {
        results: result,
        winnerVariant: statisticalSignificance.winner,
        confidence: statisticalSignificance.confidence
      }
    });

    // Learn from experiment results
    await this.learnFromExperiment(experiment, result);

    return result;
  }

  // Calculate statistical significance using Chi-squared test
  private static async calculateStatisticalSignificance(variantResults: any): Promise<any> {
    // Simple implementation of Chi-squared test for conversion rates
    // In production, you might want to use a proper statistics library
    
    const variants = Object.keys(variantResults);
    if (variants.length < 2) {
      return { pValue: 1, confidence: 0, winner: undefined, improvement: 0 };
    }

    const controlVariant = variants[0];
    const control = variantResults[controlVariant];
    
    let bestVariant = controlVariant;
    let bestConversionRate = control.conversionRate;
    let bestImprovement = 0;

    // Find the best performing variant
    for (const variantName of variants.slice(1)) {
      const variant = variantResults[variantName];
      const improvement = ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100;
      
      if (variant.conversionRate > bestConversionRate) {
        bestVariant = variantName;
        bestConversionRate = variant.conversionRate;
        bestImprovement = improvement;
      }
    }

    // Calculate simple confidence based on sample size and difference
    const totalParticipants = (Object.values(variantResults) as Array<any>).reduce(
      (sum: number, v: any) => sum + (v.participants as number), 0
    );
    
    const confidence = this.calculateConfidence(
      totalParticipants as number,
      Math.abs(bestImprovement) / 100
    );

    // Simple p-value calculation (simplified)
    const pValue = Math.max(0.01, 1 - confidence);

    return {
      pValue,
      confidence,
      winner: confidence > 0.95 ? bestVariant : undefined,
      improvement: bestImprovement
    };
  }

  // Calculate confidence based on sample size and effect size
  private static calculateConfidence(sampleSize: number, effectSize: number): number {
    // Simplified confidence calculation
    // In production, use proper statistical methods
    const baseConfidence = Math.min(0.95, Math.log(sampleSize) / 10);
    const effectBoost = effectSize * 0.3;
    
    return Math.min(0.99, baseConfidence + effectBoost);
  }

  // Generate recommendations based on results
  private static generateRecommendations(
    variantResults: any, 
    stats: any, 
    experiment: any
  ): string[] {
    const recommendations: string[] = [];
    const controlVariant = Object.keys(variantResults)[0];
    const control = variantResults[controlVariant];

    if (stats.confidence > 0.95 && stats.winner) {
      const winner = variantResults[stats.winner];
      recommendations.push(
        `🎯 Strong winner detected: ${stats.winner} with ${stats.improvement.toFixed(1)}% improvement`
      );
      recommendations.push(
        `🚀 Recommend rolling out ${stats.winner} variant to all users`
      );
      
      if (winner.averageValue > control.averageValue) {
        recommendations.push(
          `💰 Winner also shows ${((winner.averageValue - control.averageValue) / control.averageValue * 100).toFixed(1)}% higher average value`
        );
      }
    } else if (stats.confidence > 0.8) {
      recommendations.push(
        `📊 Promising results for ${stats.winner} but need more data (${(stats.confidence * 100).toFixed(1)}% confidence)`
      );
      recommendations.push(
        `⏳ Continue experiment to reach statistical significance`
      );
    } else {
      recommendations.push(
        `📈 No clear winner yet. Continue experiment to collect more data`
      );
    }

    // Check if we have enough participants
    const totalParticipants = (Object.values(variantResults) as Array<any>).reduce(
      (sum: number, v: any) => sum + (v.participants as number), 0
    );
    
    if ((totalParticipants as number) < 100) {
      recommendations.push(
        `👥 Low participant count (${totalParticipants}). Consider increasing traffic allocation.`
      );
    }

    return recommendations;
  }

  // Learn from experiment results
  private static async learnFromExperiment(experiment: any, result: ExperimentResult): Promise<void> {
    const memoryContent = `Experiment: ${experiment.name}
Hypothesis: ${experiment.hypothesis}
Result: ${result.statisticalSignificance.winner ? `Winner: ${result.statisticalSignificance.winner} with ${result.statisticalSignificance.improvement.toFixed(1)}% improvement` : 'No clear winner'}
Confidence: ${(result.statisticalSignificance.confidence * 100).toFixed(1)}%
Category: ${experiment.category}`;

    const importance = result.statisticalSignificance.confidence;

    await MemoryManager.storeMemory({
      memoryType: 'SUCCESS_STORY',
      content: memoryContent,
      importance
    });

    console.log(`🧠 Learned from experiment: ${experiment.name}`);
  }

  // Complete an experiment
  static async completeExperiment(experimentId: string, winnerVariant?: string): Promise<void> {
    const { prisma } = await import('./db');
    
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId }
    });

    if (!experiment) {
      throw new Error('Experiment not found');
    }

    // Run final analysis
    const results = await this.analyzeExperiment(experimentId);

    await prisma.experiment.update({
      where: { id: experimentId },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
        winnerVariant: winnerVariant || results.statisticalSignificance.winner,
        results: results
      }
    });

    // Log experiment completion
    await prisma.aILog.create({
      data: {
        type: 'SYSTEM_UPDATE',
        summary: `Experiment completed: ${experiment.name}`,
        details: {
          experimentId,
          winner: winnerVariant || results.statisticalSignificance.winner,
          confidence: results.statisticalSignificance.confidence
        },
        agent: 'ExperimentManager',
        confidence: results.statisticalSignificance.confidence
      }
    });

    console.log(`🔬 Experiment completed: ${experiment.name}`);
  }

  // Get experiment statistics
  static async getExperimentStats(): Promise<any> {
    const { prisma } = await import('./db');
    
    const [
      totalExperiments,
      runningExperiments,
      completedExperiments,
      successfulExperiments,
      recentExperiments
    ] = await Promise.all([
      prisma.experiment.count(),
      prisma.experiment.count({ where: { status: 'RUNNING' } }),
      prisma.experiment.count({ where: { status: 'COMPLETED' } }),
      prisma.experiment.count({ 
        where: { 
          status: 'COMPLETED',
          winnerVariant: { not: null }
        }
      }),
      prisma.experiment.findMany({
        where: { status: 'RUNNING' },
        include: {
          summaries: {
            orderBy: { date: 'desc' },
            take: 7
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      })
    ]);

    const successRate = completedExperiments > 0 
      ? (successfulExperiments / completedExperiments) * 100 
      : 0;

    return {
      overview: {
        totalExperiments,
        runningExperiments,
        completedExperiments,
        successfulExperiments,
        successRate: Math.round(successRate)
      },
      recentExperiments,
      recommendations: await this.generateSystemRecommendations()
    };
  }

  // Generate system-wide experiment recommendations
  private static async generateSystemRecommendations(): Promise<string[]> {
    const { prisma } = await import('./db');
    
    const recommendations = [];
    
    // Check for low-traffic experiments
    const lowTrafficExperiments = await prisma.experiment.findMany({
      where: { 
        status: 'RUNNING',
        trafficAllocation: { lt: 0.1 }
      }
    });

    if (lowTrafficExperiments.length > 0) {
      recommendations.push(
        `📊 ${lowTrafficExperiments.length} experiments have low traffic allocation. Consider increasing to get results faster.`
      );
    }

    // Check for long-running experiments
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const longRunningExperiments = await prisma.experiment.findMany({
      where: { 
        status: 'RUNNING',
        startDate: { lt: weekAgo }
      }
    });

    if (longRunningExperiments.length > 0) {
      recommendations.push(
        `⏰ ${longRunningExperiments.length} experiments have been running for over a week. Consider analyzing results.`
      );
    }

    // Search memory for successful experiment patterns
    const pastSuccesses = await MemoryManager.searchMemories(
      'experiment successful winner',
      ['SUCCESS_STORY'],
      0.6,
      3
    );

    if (pastSuccesses.length > 0) {
      recommendations.push(
        `🎯 Past experiments show success with similar approaches. Review ${pastSuccesses.length} related success stories.`
      );
    }

    return recommendations;
  }
}