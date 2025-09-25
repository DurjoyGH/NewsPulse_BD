const express = require("express");
const router = express.Router();
const summaryController = require("../controllers/summaryController");

// Existing route for text summarization
router.post("/text", summaryController.summarizeText);

// Article summarization routes
router.post("/article/:articleId", summaryController.summarizeArticle);
router.get("/article/:articleId", summaryController.getArticleSummary);

// Bulk processing routes
router.post("/process-all", summaryController.processAllArticlesToSummaries);

// Summary management routes
router.get("/", summaryController.getAllSummaries);
router.get("/grouped-by-category", summaryController.getSummariesGroupedByCategory);
router.delete("/:summaryId", summaryController.deleteSummary);

// Statistics route
router.get("/statistics", summaryController.getSummaryStatistics);

module.exports = router;