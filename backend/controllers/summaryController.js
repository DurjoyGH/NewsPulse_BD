const axios = require("axios");
const Article = require("../models/Article");
const Summary = require("../models/Summary");

const SUMMARIZE_API_URL =
  "https://cmfyvn5v38dg62py5l86k12a1.agent.a.smyth.ai/api/summarize_bengali";

exports.summarizeText = async (req, res) => {
  try {
    const { text, bengali_text } = req.body;

    // Accept both 'text' and 'bengali_text' for flexibility
    const textToSummarize = bengali_text || text;

    if (!textToSummarize || textToSummarize.trim() === "") {
      return res.status(400).json({
        message: "Bengali text is required for summarization",
      });
    }

    // Call external summarization API with correct parameter name
    const response = await axios.post(
      SUMMARIZE_API_URL,
      {
        bengali_text: textToSummarize,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );

    res.json({
      message: "Text summarized successfully",
      originalText: textToSummarize,
      summary: response.data, // API returns plain string
      success: true,
    });
  } catch (error) {
    console.error("Summarization error:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(408).json({
        message: "Request timeout - summarization service is taking too long",
      });
    }

    if (error.response) {
      return res.status(error.response.status || 500).json({
        message: "Summarization service error",
        error: error.response.data || error.message,
      });
    }

    res.status(500).json({
      message: "Failed to summarize text",
      error: "Internal server error",
    });
  }
};

exports.summarizeArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!articleId) {
      return res.status(400).json({
        message: "Article ID is required",
      });
    }

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    // Check if summary already exists for this article
    const existingSummary = await Summary.findOne({ article: articleId });
    if (existingSummary) {
      return res.json({
        message: "Summary already exists for this article",
        summary: {
          id: existingSummary._id,
          article: existingSummary.article,
          summaryText: existingSummary.summaryText,
          generatedAt: existingSummary.generatedAt,
        },
        success: true,
      });
    }

    // Check if article has content to summarize
    if (!article.content || article.content.trim() === "") {
      return res.status(400).json({
        message: "Article has no content to summarize",
      });
    }

    // Call external summarization API
    const response = await axios.post(
      SUMMARIZE_API_URL,
      {
        bengali_text: article.content,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const summaryText = response.data;

    // Save summary to database
    const newSummary = await Summary.create({
      article: articleId,
      summaryText: summaryText,
    });

    // Populate article details in response
    await newSummary.populate("article", "title url publishedAt");

    res.json({
      message: "Article summarized and saved successfully",
      summary: {
        id: newSummary._id,
        article: newSummary.article,
        summaryText: newSummary.summaryText,
        generatedAt: newSummary.generatedAt,
      },
      success: true,
    });
  } catch (error) {
    console.error("Article summarization error:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(408).json({
        message: "Request timeout - summarization service is taking too long",
      });
    }

    if (error.response) {
      return res.status(error.response.status || 500).json({
        message: "Summarization service error",
        error: error.response.data || error.message,
      });
    }

    res.status(500).json({
      message: "Failed to summarize article",
      error: "Internal server error",
    });
  }
};

exports.getArticleSummary = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!articleId) {
      return res.status(400).json({
        message: "Article ID is required",
      });
    }

    // Find summary with article details
    const summary = await Summary.findOne({ article: articleId }).populate(
      "article",
      "title url publishedAt"
    );

    if (!summary) {
      return res.status(404).json({
        message: "No summary found for this article",
      });
    }

    res.json({
      message: "Summary retrieved successfully",
      summary: {
        id: summary._id,
        article: summary.article,
        summaryText: summary.summaryText,
        generatedAt: summary.generatedAt,
      },
      success: true,
    });
  } catch (error) {
    console.error("Get summary error:", error.message);
    res.status(500).json({
      message: "Failed to retrieve summary",
      error: "Internal server error",
    });
  }
};
