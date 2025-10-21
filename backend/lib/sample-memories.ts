// Initialize system with sample memories for learning
import { MemoryManager } from './memory-manager';

export class SampleMemories {
  static async initialize(): Promise<void> {
    console.log('🧠 Initializing sample memories...');
    
    const sampleMemories = [
      {
        memoryType: 'PROJECT_FIX' as const,
        content: `Project: E-Commerce AI Assistant\nIssue: High API error rate during peak hours\nSolution: Implemented request queuing and retry logic\nEffectiveness: 0.9`,
        importance: 0.8
      },
      {
        memoryType: 'PROJECT_FIX' as const,
        content: `Project: Mobile Health Tracker\nIssue: Database connection timeouts\nSolution: Added connection pooling and timeout configuration\nEffectiveness: 0.95`,
        importance: 0.7
      },
      {
        memoryType: 'INVESTMENT_DECISION' as const,
        content: `Investment: API Quota Upgrade\nCost: $300\nExpected ROI: 50%\nActual ROI: 60%\nRisk: LOW\nAccuracy: 0.83`,
        importance: 0.6
      },
      {
        memoryType: 'SUCCESS_STORY' as const,
        content: `Content marketing campaign generated 45 new users with $200 budget. Focus on AI tool tutorials worked well.`,
        importance: 0.8
      },
      {
        memoryType: 'BEST_PRACTICE' as const,
        content: `Regular database maintenance every 2 weeks prevents performance issues. Monitor error rates daily.`,
        importance: 0.9
      },
      {
        memoryType: 'FAILURE_LEARNING' as const,
        content: `Social media ad campaign failed to convert. Audience targeting was too broad. Need more specific tech-focused channels.`,
        importance: 0.7
      }
    ];

    let addedCount = 0;
    for (const memory of sampleMemories) {
      try {
        await MemoryManager.storeMemory(memory);
        addedCount++;
      } catch (error) {
        console.error('Error storing sample memory:', error);
      }
    }

    console.log(`🧠 Added ${addedCount} sample memories`);
  }
}