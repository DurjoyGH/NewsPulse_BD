const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const Article = require('../models/Article');
const NewsSource = require('../models/NewsSource');

class ArticleProcessingService {
  constructor() {
    this.newsFile = path.join(__dirname, '../data/news.json');
    this.SUMMARIZE_API_URL = 'https://cmfyvn5v38dg62py5l86k12a1.agent.a.smyth.ai/api/summarize_bengali';
  }

  async processNewsAndSaveArticles() {
    try {
      console.log('Starting article processing from news.json...');
      
      // Read news.json file
      const newsData = await this.readNewsData();
      if (!newsData || newsData.length === 0) {
        console.log('No news data found in news.json');
        return { processed: 0, saved: 0, errors: 0 };
      }

      // Filter articles with non-empty content
      const articlesWithContent = this.filterArticlesWithContent(newsData);
      console.log(`Found ${articlesWithContent.length} articles with content out of ${newsData.length} total articles`);

      if (articlesWithContent.length === 0) {
        console.log('No articles with content found');
        return { processed: 0, saved: 0, errors: 0 };
      }

      let processed = 0;
      let saved = 0;
      let errors = 0;

      // Process each article
      for (const newsItem of articlesWithContent) {
        try {
          await this.processArticle(newsItem);
          processed++;
          saved++;
          console.log(`✓ Processed article: ${newsItem.title.substring(0, 50)}...`);
        } catch (error) {
          console.error(`✗ Error processing article "${newsItem.title}":`, error.message);
          errors++;
        }
      }

      console.log(`Article processing completed: ${processed} processed, ${saved} saved, ${errors} errors`);
      return { processed, saved, errors };

    } catch (error) {
      console.error('Error in article processing service:', error);
      throw error;
    }
  }

  async readNewsData() {
    try {
      const data = await fs.readFile(this.newsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading news.json:', error);
      throw error;
    }
  }

  filterArticlesWithContent(newsData) {
    return newsData.filter(item => {
      // Check if content exists and is not empty after trimming
      return item.content && 
             typeof item.content === 'string' && 
             item.content.trim().length > 0 &&
             item.title &&
             item.link;
    });
  }

  async processArticle(newsItem) {
    try {
      // Check if article already exists
      const existingArticle = await Article.findOne({ url: newsItem.link });
      if (existingArticle) {
        console.log(`Article already exists: ${newsItem.title.substring(0, 50)}...`);
        return;
      }

      // Get or create news source
      const newsSource = await this.getOrCreateNewsSource(newsItem.source);

      // Summarize the content
      const summarizedContent = await this.summarizeContent(newsItem.content);

      // Create article data
      const articleData = {
        source: newsSource._id,
        title: newsItem.title,
        content: summarizedContent,
        url: newsItem.link,
        publishedAt: newsItem.publishedDate ? new Date(newsItem.publishedDate) : new Date(),
        imageUrl: newsItem.imageUrl || null
      };

      // Save article to database
      const article = new Article(articleData);
      await article.save();

      return article;
    } catch (error) {
      console.error(`Error processing individual article:`, error);
      throw error;
    }
  }

  async getOrCreateNewsSource(sourceName) {
    try {
      // Try to find existing news source
      let newsSource = await NewsSource.findOne({ name: sourceName });
      
      if (!newsSource) {
        // Create new news source if it doesn't exist
        newsSource = new NewsSource({
          name: sourceName,
          url: `https://${sourceName.toLowerCase().replace(/\s+/g, '')}.com` // Default URL
        });
        await newsSource.save();
        console.log(`Created new news source: ${sourceName}`);
      }
      
      return newsSource;
    } catch (error) {
      console.error(`Error getting/creating news source:`, error);
      throw error;
    }
  }

  async summarizeContent(content) {
    try {
      if (!content || content.trim().length === 0) {
        throw new Error('Content is empty');
      }

      // Call summarization API
      const response = await axios.post(
        this.SUMMARIZE_API_URL,
        {
          bengali_text: content
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      return response.data || content; // Return original if summarization fails

    } catch (error) {
      console.error('Summarization failed, using original content:', error.message);
      // Return original content if summarization fails
      return content;
    }
  }

  // Method to process a single article by ID (for manual processing)
  async processArticleById(articleId) {
    try {
      const newsData = await this.readNewsData();
      const article = newsData.find(item => item.id === articleId);
      
      if (!article) {
        throw new Error(`Article with ID ${articleId} not found`);
      }

      if (!article.content || article.content.trim().length === 0) {
        throw new Error('Article has no content');
      }

      return await this.processArticle(article);
    } catch (error) {
      console.error(`Error processing article ${articleId}:`, error);
      throw error;
    }
  }

  // Method to get statistics about news data
  async getNewsStatistics() {
    try {
      const newsData = await this.readNewsData();
      const withContent = this.filterArticlesWithContent(newsData);
      
      return {
        total: newsData.length,
        withContent: withContent.length,
        withoutContent: newsData.length - withContent.length,
        sources: [...new Set(newsData.map(item => item.source))]
      };
    } catch (error) {
      console.error('Error getting news statistics:', error);
      throw error;
    }
  }
}

module.exports = ArticleProcessingService;
