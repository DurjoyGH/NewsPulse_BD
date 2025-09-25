const express = require("express");
const router = express.Router();
const summaryController = require("../controllers/summaryController");

// Existing route for text summarization
router.post("/text", summaryController.summarizeText);

// New routes for article summarization
router.post("/article/:articleId", summaryController.summarizeArticle);
router.get("/article/:articleId", summaryController.getArticleSummary);

module.exports = router;