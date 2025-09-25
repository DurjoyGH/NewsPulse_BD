const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Process all news from news.json and save as articles
router.post('/process-all', articleController.processNewsToArticles);

// Process a single article by ID
router.post('/process/:articleId', articleController.processArticleById);

// Get news statistics
router.get('/statistics', articleController.getNewsStatistics);

// Get all articles with pagination
router.get('/', articleController.getAllArticles);

// Get single article by ID
router.get('/:id', articleController.getArticleById);

// Delete article
router.delete('/:id', articleController.deleteArticle);

module.exports = router;
