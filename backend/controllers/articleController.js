const ArticleProcessingService = require('../services/ArticleProcessingService');
const Article = require('../models/Article');

const articleProcessingService = new ArticleProcessingService();

// Process all news from news.json and save as articles
exports.processNewsToArticles = async (req, res) => {
  try {
    console.log('Starting bulk news processing...');
    
    const result = await articleProcessingService.processNewsAndSaveArticles();
    
    res.json({
      message: 'News processing completed successfully',
      result: {
        processed: result.processed,
        saved: result.saved,
        errors: result.errors
      },
      success: true
    });

  } catch (error) {
    console.error('Error in processNewsToArticles:', error);
    res.status(500).json({
      message: 'Error processing news to articles',
      error: error.message,
      success: false
    });
  }
};

// Process a single article by ID
exports.processArticleById = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    if (!articleId) {
      return res.status(400).json({
        message: 'Article ID is required',
        success: false
      });
    }

    const article = await articleProcessingService.processArticleById(articleId);
    
    res.json({
      message: 'Article processed successfully',
      article: article,
      success: true
    });

  } catch (error) {
    console.error('Error in processArticleById:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        message: error.message,
        success: false
      });
    }

    res.status(500).json({
      message: 'Error processing article',
      error: error.message,
      success: false
    });
  }
};

// Get news statistics
exports.getNewsStatistics = async (req, res) => {
  try {
    const stats = await articleProcessingService.getNewsStatistics();
    
    res.json({
      message: 'News statistics retrieved successfully',
      statistics: stats,
      success: true
    });

  } catch (error) {
    console.error('Error in getNewsStatistics:', error);
    res.status(500).json({
      message: 'Error retrieving news statistics',
      error: error.message,
      success: false
    });
  }
};

// Get all saved articles
exports.getAllArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const articles = await Article.find()
      .populate('source', 'name url logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments();

    res.json({
      message: 'Articles retrieved successfully',
      articles: articles,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total,
        limit: limit
      },
      success: true
    });

  } catch (error) {
    console.error('Error in getAllArticles:', error);
    res.status(500).json({
      message: 'Error retrieving articles',
      error: error.message,
      success: false
    });
  }
};

// Get single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id).populate('source', 'name url logo');

    if (!article) {
      return res.status(404).json({
        message: 'Article not found',
        success: false
      });
    }

    res.json({
      message: 'Article retrieved successfully',
      article: article,
      success: true
    });

  } catch (error) {
    console.error('Error in getArticleById:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid article ID',
        success: false
      });
    }

    res.status(500).json({
      message: 'Error retrieving article',
      error: error.message,
      success: false
    });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        message: 'Article not found',
        success: false
      });
    }

    res.json({
      message: 'Article deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('Error in deleteArticle:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid article ID',
        success: false
      });
    }

    res.status(500).json({
      message: 'Error deleting article',
      error: error.message,
      success: false
    });
  }
};
