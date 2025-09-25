const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Classify single news article
router.post("/classify", categoryController.classifyNews);

// Categorize all summaries
router.post("/categorize-summaries", categoryController.categorizeSummaries);

// Get summaries by category
router.get("/summaries/:categoryId", categoryController.getSummariesByCategory);

// Get all categories with summary counts
router.get("/categories-with-counts", categoryController.getCategoriesWithCounts);

module.exports = router;