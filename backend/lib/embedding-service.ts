// Service for creating and managing text embeddings with OpenAI
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export class EmbeddingService {
  private static readonly EMBEDDING_MODEL = 'text-embedding-3-small'; // 1536 dimensions
  private static readonly SIMILARITY_THRESHOLD = 0.78; // Minimum similarity score

  // Create embedding for a piece of text
  static async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: this.EMBEDDING_MODEL,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw new Error(`Failed to create embedding: ${error.message}`);
    }
  }

  // Store content with its embedding in the database
  static async storeEmbedding(
    content: string, 
    contentType: string, 
    metadata: any = {}
  ): Promise<string> {
    const { prisma } = await import('./db');
    
    try {
      // Create embedding
      const vector = await this.createEmbedding(content);
      
      // Store in database (Prisma doesn't directly support vector type, 
      // so we'll use raw SQL for this operation)
      const result = await prisma.$executeRaw`
        INSERT INTO embeddings (content, "contentType", vector, metadata, "createdAt")
        VALUES (${content}, ${contentType}, ${vector}::vector, ${metadata}, NOW())
        RETURNING id
      `;

      // For now, we'll use a workaround since Prisma doesn't support vector directly
      // We'll implement the actual vector storage in the next step with raw queries
      const embedding = await prisma.embedding.create({
        data: {
          content,
          contentType,
          metadata,
          // Note: vector field will be handled separately via raw queries
        }
      });

      return embedding.id;
    } catch (error) {
      console.error('Error storing embedding:', error);
      throw new Error(`Failed to store embedding: ${error.message}`);
    }
  }

  // Find similar content using vector similarity search
  static async findSimilar(
    query: string, 
    contentType?: string,
    limit: number = 5
  ): Promise<Array<{
    id: string;
    content: string;
    contentType: string;
    metadata: any;
    similarity: number;
  }>> {
    const { prisma } = await import('./db');
    
    try {
      // Create embedding for the query
      const queryVector = await this.createEmbedding(query);
      
      // Use raw SQL for vector similarity search
      // This uses cosine similarity (vector <=> operator in pgvector)
      const similarItems = await prisma.$queryRaw`
        SELECT 
          id,
          content,
          "contentType",
          metadata,
          (vector <=> ${queryVector}::vector) as similarity
        FROM embeddings
        WHERE ${contentType}::text IS NULL OR "contentType" = ${contentType}
        ORDER BY vector <=> ${queryVector}::vector
        LIMIT ${limit}
      `;

      // Filter by similarity threshold and format results
      const results = (similarItems as any[])
        .filter(item => item.similarity <= this.SIMILARITY_THRESHOLD)
        .map(item => ({
          id: item.id,
          content: item.content,
          contentType: item.contentType,
          metadata: item.metadata,
          similarity: 1 - item.similarity // Convert distance to similarity
        }));

      return results;
    } catch (error) {
      console.error('Error finding similar content:', error);
      
      // Fallback: simple text search if vector search fails
      return this.fallbackTextSearch(query, contentType, limit);
    }
  }

  // Fallback text search when vector search is unavailable
  private static async fallbackTextSearch(
    query: string, 
    contentType?: string,
    limit: number = 5
  ): Promise<any[]> {
    const { prisma } = await import('./db');
    
    const whereClause: any = {};
    if (contentType) {
      whereClause.contentType = contentType;
    }

    const embeddings = await prisma.embedding.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Simple text similarity (very basic fallback)
    const queryWords = query.toLowerCase().split(' ');
    return embeddings.map(embedding => {
      const content = embedding.content.toLowerCase();
      let score = 0;
      
      for (const word of queryWords) {
        if (content.includes(word)) {
          score += 1;
        }
      }
      
      const similarity = score / queryWords.length;
      
      return {
        id: embedding.id,
        content: embedding.content,
        contentType: embedding.contentType,
        metadata: embedding.metadata,
        similarity: Math.min(similarity, 0.9) // Cap at 0.9 for fallback
      };
    }).filter(item => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}