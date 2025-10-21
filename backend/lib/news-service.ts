import axios from 'axios';

export class NewsService {
  static async fetchTechNews(category?: string) {
    try {
      // Using NewsAPI (replace with News.io when available)
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          category: 'technology',
          language: 'en',
          pageSize: 20,
          apiKey: process.env.NEWS_API_KEY,
        },
      });

      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        imageUrl: article.urlToImage,
        publishedAt: new Date(article.publishedAt),
        category: 'technology',
      }));
    } catch (error) {
      console.error('News API error:', error);
      
      // Fallback mock data
      return this.getMockNews();
    }
  }

  private static getMockNews() {
    return [
      {
        title: "AI Breakthrough: New Model Achieves Human-Level Reasoning",
        description: "Latest AI model demonstrates unprecedented reasoning capabilities...",
        url: "https://example.com/ai-breakthrough",
        source: "Tech News",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
        publishedAt: new Date(),
        category: "AI"
      },
      {
        title: "Startup Ecosystem Thrives Despite Economic Challenges",
        description: "Digital startups continue to attract investment in AI and SaaS sectors...",
        url: "https://example.com/startup-ecosystem",
        source: "Business Daily",
        imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400",
        publishedAt: new Date(Date.now() - 86400000),
        category: "Business"
      }
    ];
  }

  static async saveNewsToDB(newsItems: any[]) {
    const { prisma } = await import('./db');
    
    for (const item of newsItems) {
      await prisma.newsFeed.upsert({
        where: { url: item.url },
        update: {},
        create: item,
      });
    }
  }
}