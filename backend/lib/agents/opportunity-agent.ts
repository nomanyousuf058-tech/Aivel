// AI Agent specialized in finding business opportunities
import { AIAgentBase, AgentTask, AgentResult } from '../ai-agent-base';
import { AIService } from '../ai-service';
import { MemoryManager } from '../memory-manager';

export class OpportunityAgent extends AIAgentBase {
  protected async performTask(task: AgentTask): Promise<AgentResult> {
    const { marketData, userMetrics, constraints } = task.input;
    
    // Search for past opportunities and learnings
    const pastOpportunities = await MemoryManager.searchMemories(
      'opportunity success failure business growth',
      ['SUCCESS_STORY', 'FAILURE_LEARNING', 'BEST_PRACTICE'],
      0.7,
      5
    );

    const prompt = `
      BUSINESS OPPORTUNITY ANALYSIS:
      
      Market Data: ${JSON.stringify(marketData, null, 2)}
      User Metrics: ${JSON.stringify(userMetrics, null, 2)}
      Constraints: ${JSON.stringify(constraints, null, 2)}
      
      PAST LEARNINGS:
      ${pastOpportunities.map(opp => `- ${opp.content}`).join('\n')}
      
      Analyze and identify the top 3 business opportunities. For each opportunity, provide:
      
      1. Description
      2. Estimated impact (0-10)
      3. Implementation effort (LOW|MEDIUM|HIGH)
      4. Risks
      5. Required resources
      6. Timeline
      
      Return as JSON:
      {
        "opportunities": [
          {
            "title": "Opportunity title",
            "description": "Detailed description",
            "impact": 8,
            "effort": "MEDIUM",
            "risks": ["risk1", "risk2"],
            "resources": ["resource1", "resource2"],
            "timeline": "2-4 weeks",
            "confidence": 0.85
          }
        ],
        "summary": "Overall analysis summary"
      }
    `;

    try {
      const response = await AIService.chatWithAIVEL(prompt, {
        agent: 'OpportunityAgent',
        task: 'opportunity_analysis'
      });

      const opportunities = this.parseOpportunityResponse(response);
      const confidence = this.calculateOpportunityConfidence(opportunities);

      // Store top opportunity in memory
      if (opportunities.opportunities?.length > 0) {
        const topOpportunity = opportunities.opportunities[0];
        await MemoryManager.storeMemory({
          memoryType: 'BEST_PRACTICE',
          content: `Opportunity identified: ${topOpportunity.title}. Impact: ${topOpportunity.impact}, Effort: ${topOpportunity.effort}`,
          importance: topOpportunity.confidence || 0.7
        });
      }

      return {
        success: true,
        output: opportunities,
        confidence,
        costEstimate: await this.estimateCost(task),
        reasoning: `Analyzed ${opportunities.opportunities?.length || 0} business opportunities`,
        risks: opportunities.opportunities?.flatMap((opp: any) => opp.risks) || [],
        recommendations: opportunities.opportunities?.map((opp: any) => opp.title) || []
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        confidence: 0,
        costEstimate: await this.estimateCost(task),
        reasoning: `Failed to analyze opportunities: ${error.message}`
      };
    }
  }

  private parseOpportunityResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      return {
        opportunities: [],
        summary: 'Failed to parse AI response',
        error: error.message
      };
    }
  }

  private calculateOpportunityConfidence(opportunities: any): number {
    if (!opportunities.opportunities || opportunities.opportunities.length === 0) {
      return 0.1;
    }

    const avgConfidence = opportunities.opportunities.reduce(
      (sum: number, opp: any) => sum + (opp.confidence || 0.7), 0
    ) / opportunities.opportunities.length;

    return Math.max(0.1, Math.min(0.95, avgConfidence));
  }
}