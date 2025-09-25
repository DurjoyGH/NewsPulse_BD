const fs = require('fs').promises;
const path = require('path');

class NewsStorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.newsFile = path.join(this.dataDir, 'news.json');
    this.initStorage();
  }

  async initStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize news file if it doesn't exist
      try {
        await fs.access(this.newsFile);
      } catch {
        await fs.writeFile(this.newsFile, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Storage initialization error:', error);
    }
  }

  async saveNewsItems(newsItems) {
    try {
      const existingNews = await this.getAllNews();
      const existingIds = new Set(existingNews.map(item => item.id));
      
      // Filter out duplicates
      const newItems = newsItems.filter(item => !existingIds.has(item.id));
      
      if (newItems.length > 0) {
        const updatedNews = [...existingNews, ...newItems];
        
        // Keep only last 1000 items to prevent file from growing too large
        const limitedNews = updatedNews.slice(-1000);
        
        await fs.writeFile(this.newsFile, JSON.stringify(limitedNews, null, 2));
        console.log(`Saved ${newItems.length} new news items`);
      }
      
      return newItems.length;
    } catch (error) {
      console.error('Error saving news items:', error);
      throw error;
    }
  }

  async getAllNews() {
    try {
      const data = await fs.readFile(this.newsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading news:', error);
      return [];
    }
  }

  async getNewsByCategory(category) {
    const allNews = await this.getAllNews();
    return allNews.filter(item => item.category === category);
  }

  async getNewsBySource(sourceName) {
    const allNews = await this.getAllNews();
    return allNews.filter(item => item.source === sourceName);
  }

  async updateNewsItem(id, updates) {
    try {
      const allNews = await this.getAllNews();
      const index = allNews.findIndex(item => item.id === id);
      
      if (index !== -1) {
        allNews[index] = { ...allNews[index], ...updates };
        await fs.writeFile(this.newsFile, JSON.stringify(allNews, null, 2));
        return allNews[index];
      }
      
      return null;
    } catch (error) {
      console.error('Error updating news item:', error);
      throw error;
    }
  }
}

module.exports = NewsStorageService;