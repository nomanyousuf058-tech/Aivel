// AI Memory Manager - Stores and retrieves learned experiences
import { EmbeddingService } from './embedding-service';

export interface MemoryItem {
  memoryType: string;
  content: string;
  importance?: number;
  relatedEmbeddingId?: string;
}

export class MemoryManager {
  // Store a new memory with automatic embedding
  static async storeMemory(memory: MemoryItem): Promise<string> {
    const { prisma } = await import('./db');
    
    try {
      let embeddingId: string | undefined;

      // Create embedding for the memory content if it's substantial
      if (memory.content.length > 20) {
        embeddingId = await EmbeddingService.storeEmbedding(
          memory.content,
          'SYSTEM_LOG',
          { memoryType: memory.memoryType, importance: memory.importance }
        );
      }

      // Store the memory
      const aiMemory = await prisma.aIMemory.create({
        data: {
          memoryType: memory.memoryType,
          content: memory.content,
          embeddingId: embeddingId,
          importance: memory.importance || 0.5,
          accessedAt: new Date(),
          accessCount: 0
        }
      });

      console.log(`🧠 Stored memory: ${memory.memoryType} - ${memory.content.substring(0, 50)}...`);
      return aiMemory.id;
    } catch (error) {
      console.error('Error storing memory:', error);
      throw new Error(`Failed to store memory: ${error.message}`);
    }
  }

  // Search for relevant memories based on a query
  static async searchMemories(
    query: string, 
    memoryTypes?: string[],
    minImportance: number = 0.3,
    limit: number = 10
  ): Promise<Array<{
    id: string;
    memoryType: string;
    content: string;
    importance: number;
    similarity: number;
    lastAccessed: Date;
    accessCount: number;
  }>> {
    const { prisma } = await import('./db');
    
    try {
      // First, try vector search on embeddings
      const similarEmbeddings = await EmbeddingService.findSimilar(
        query, 
        'SYSTEM_LOG', 
        limit * 2 // Get more for filtering
      );

      // Get the actual memory records for these embeddings
      const embeddingIds = similarEmbeddings.map(e => e.id);
      const vectorMemories = await prisma.aIMemory.findMany({
        where: {
          embeddingId: { in: embeddingIds },
          importance: { gte: minImportance },
          ...(memoryTypes && { memoryType: { in: memoryTypes } })
        },
        include: {
          embedding: true
        }
      });

      // Combine with similarity scores
      const vectorResults = vectorMemories.map(memory => {
        const embedding = similarEmbeddings.find(e => e.id === memory.embeddingId);
        return {
          id: memory.id,
          memoryType: memory.memoryType,
          content: memory.content,
          importance: memory.importance,
          similarity: embedding?.similarity || 0.5,
          lastAccessed: memory.accessedAt,
          accessCount: memory.accessCount
        };
      }).sort((a, b) => b.similarity - a.similarity);

      // Also do a text-based search as fallback/backup
      const textMemories = await prisma.aIMemory.findMany({
        where: {
          importance: { gte: minImportance },
          ...(memoryTypes && { memoryType: { in: memoryTypes } }),
          OR: [
            { content: { contains: query, mode: 'insensitive' } },
            { memoryType: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: [
          { importance: 'desc' },
          { accessedAt: 'desc' }
        ],
        take: limit
      });

      const textResults = textMemories.map(memory => ({
        id: memory.id,
        memoryType: memory.memoryType,
        content: memory.content,
        importance: memory.importance,
        similarity: 0.7, // Default similarity for text matches
        lastAccessed: memory.accessedAt,
        accessCount: memory.accessCount
      }));

      // Combine and deduplicate results
      const allResults = [...vectorResults, ...textResults];
      const uniqueResults = allResults.filter((result, index, self) =>
        index === self.findIndex(r => r.id === result.id)
      );

      // Sort by combined score (similarity + importance)
      const scoredResults = uniqueResults.map(result => ({
        ...result,
        score: (result.similarity * 0.7) + (result.importance * 0.3)
      })).sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Update access counts for retrieved memories
      await this.updateAccessCounts(scoredResults.map(r => r.id));

      // Log the memory access
      for (const result of scoredResults) {
        await prisma.memoryAccessLog.create({
          data: {
            memoryId: result.id,
            query: query,
            similarity: result.similarity
          }
        });
      }

      return scoredResults;
    } catch (error) {
      console.error('Error searching memories:', error);
      
      // Fallback to simple text search
      return await this.fallbackMemorySearch(query, memoryTypes, limit);
    }
  }

  // Update access counts for memories
  private static async updateAccessCounts(memoryIds: string[]): Promise<void> {
    const { prisma } = await import('./db');
    
    if (memoryIds.length === 0) return;

    await prisma.aIMemory.updateMany({
      where: { id: { in: memoryIds } },
      data: {
        accessCount: { increment: 1 },
        accessedAt: new Date()
      }
    });
  }

  // Fallback memory search
  private static async fallbackMemorySearch(
    query: string, 
    memoryTypes?: string[],
    limit: number = 10
  ): Promise<any[]> {
    const { prisma } = await import('./db');
    
    const memories = await prisma.aIMemory.findMany({
      where: {
        ...(memoryTypes && { memoryType: { in: memoryTypes } }),
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { memoryType: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: [
        { importance: 'desc' },
        { accessedAt: 'desc' }
      ],
      take: limit
    });

    return memories.map(memory => ({
      id: memory.id,
      memoryType: memory.memoryType,
      content: memory.content,
      importance: memory.importance,
      similarity: 0.7,
      lastAccessed: memory.accessedAt,
      accessCount: memory.accessCount
    }));
  }

  // Learn from successful project fixes
  static async learnFromProjectFix(
    projectName: string,
    issue: string,
    solution: string,
    effectiveness: number // 0-1 scale
  ): Promise<void> {
    const memoryContent = `Project: ${projectName}\nIssue: ${issue}\nSolution: ${solution}\nEffectiveness: ${effectiveness}`;
    
    const importance = effectiveness; // More effective fixes are more important to remember
    
    await this.storeMemory({
      memoryType: 'PROJECT_FIX',
      content: memoryContent,
      importance: importance
    });

    console.log(`🧠 Learned from project fix: ${issue.substring(0, 50)}...`);
  }

  // Learn from investment decisions
  static async learnFromInvestment(
    proposalTitle: string,
    cost: number,
    expectedROI: number,
    actualROI: number,
    riskLevel: string
  ): Promise<void> {
    const roiAccuracy = 1 - Math.abs(expectedROI - actualROI) / expectedROI;
    const memoryContent = `Investment: ${proposalTitle}\nCost: $${cost}\nExpected ROI: ${expectedROI}%\nActual ROI: ${actualROI}%\nRisk: ${riskLevel}\nAccuracy: ${roiAccuracy.toFixed(2)}`;
    
    const importance = roiAccuracy * 0.8 + (riskLevel === 'LOW' ? 0.2 : 0);

    await this.storeMemory({
      memoryType: 'INVESTMENT_DECISION',
      content: memoryContent,
      importance: importance
    });

    console.log(`🧠 Learned from investment: ${proposalTitle}`);
  }

  // Get memory statistics
  static async getMemoryStats(): Promise<any> {
    const { prisma } = await import('./db');
    
    const [
      totalMemories,
      memoriesByType,
      topAccessedMemories,
      recentAccessLogs
    ] = await Promise.all([
      prisma.aIMemory.count(),
      prisma.aIMemory.groupBy({
        by: ['memoryType'],
        _count: { _all: true },
        _avg: { importance: true }
      }),
      prisma.aIMemory.findMany({
        orderBy: { accessCount: 'desc' },
        take: 5
      }),
      prisma.memoryAccessLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { memory: true }
      })
    ]);

    return {
      totalMemories,
      memoriesByType,
      topAccessedMemories,
      recentAccessLogs,
      embeddingStats: {
        totalEmbeddings: await prisma.embedding.count(),
        embeddingsByType: await prisma.embedding.groupBy({
          by: ['contentType'],
          _count: { _all: true }
        })
      }
    };
  }

  // Clean up old, unimportant memories
  static async cleanupMemories(
    maxAgeDays: number = 90,
    minImportance: number = 0.2
  ): Promise<{ deleted: number }> {
    const { prisma } = await import('./db');
    
    const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    
    const result = await prisma.aIMemory.deleteMany({
      where: {
        AND: [
          { createdAt: { lt: cutoffDate } },
          { importance: { lt: minImportance } },
          { accessCount: { lt: 3 } } // Rarely accessed
        ]
      }
    });

    console.log(`🧠 Cleaned up ${result.count} old, unimportant memories`);
    return { deleted: result.count };
  }
}