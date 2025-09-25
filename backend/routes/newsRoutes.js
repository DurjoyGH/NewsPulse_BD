const express = require('express');
const router = express.Router();
const NewsExtractorService = require('../services/NewsExtractorService');
const NewsStorageService = require('../services/NewsStorageService');

const newsExtractor = new NewsExtractorService();
const newsStorage = new NewsStorageService();

// Get all news
router.get('/', async (req, res) => {
  try {
    const { category, source, limit = 50, offset = 0 } = req.query;
    let news = await newsStorage.getAllNews();
    
    // Filter by category if specified
    if (category) {
      news = news.filter(item => item.category === category);
    }
    
    // Filter by source if specified
    if (source) {
      news = news.filter(item => item.source === source);
    }
    
    // Sort by publication date (newest first)
    news.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
    
    // Apply pagination
    const paginatedNews = news.slice(offset, offset + parseInt(limit));
    
    res.json({
      news: paginatedNews,
      total: news.length,
      hasMore: offset + parseInt(limit) < news.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const news = await newsStorage.getNewsByCategory(req.params.category);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual extraction trigger
router.post('/extract', async (req, res) => {
  try {
    const newsItems = await newsExtractor.extractAllSources();
    const savedCount = await newsStorage.saveNewsItems(newsItems);
    
    res.json({
      message: 'Extraction completed',
      extracted: newsItems.length,
      saved: savedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update news item (mark as read, favorite, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const updatedItem = await newsStorage.updateNewsItem(req.params.id, req.body);
    
    if (updatedItem) {
      res.json(updatedItem);
    } else {
      res.status(404).json({ error: 'News item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available sources
router.get('/sources', (req, res) => {
  const { NEWS_SOURCES } = require('../config/newsSources');
  const allSources = [
    ...NEWS_SOURCES.phase1_rss,
    ...NEWS_SOURCES.phase2_web,
    ...NEWS_SOURCES.phase3_social
  ];
  
  res.json(allSources.filter(source => source.active));
});

module.exports = router;