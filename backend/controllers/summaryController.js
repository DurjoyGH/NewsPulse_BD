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

    // Extract summary from API response structure
    let summaryText = '';
    if (response.data && response.data.result && response.data.result.Output && response.data.result.Output.summary) {
      summaryText = response.data.result.Output.summary;
    } else {
      summaryText = String(response.data);
    }

    res.json({
      message: "Text summarized successfully",
      originalText: textToSummarize,
      summary: summaryText,
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

    // Extract summary from API response structure
    let summaryText = '';
    if (response.data && response.data.result && response.data.result.Output && response.data.result.Output.summary) {
      summaryText = response.data.result.Output.summary;
    } else {
      summaryText = String(response.data);
    }

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

// Process all articles and create summaries
exports.processAllArticlesToSummaries = async (req, res) => {
  try {
    console.log('Starting bulk article summarization...');

    // Get all articles that don't have summaries yet
    const articlesWithoutSummary = await Article.find({
      _id: { 
        $nin: await Summary.distinct('article')
      },
      content: { $exists: true, $ne: '', $ne: null }
    }).populate('source', 'name');

    if (articlesWithoutSummary.length === 0) {
      return res.json({
        message: 'No articles found that need summarization',
        result: {
          processed: 0,
          saved: 0,
          errors: 0,
          skipped: 0
        },
        success: true
      });
    }

    console.log(`Found ${articlesWithoutSummary.length} articles to summarize`);

    let processed = 0;
    let saved = 0;
    let errors = 0;
    let skipped = 0;

    // Process each article
    for (const article of articlesWithoutSummary) {
      try {
        // Check if content is valid
        if (!article.content || article.content.trim().length === 0) {
          console.log(`Skipping article with no content: ${article.title.substring(0, 50)}...`);
          skipped++;
          continue;
        }

        // Call summarization API
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

        // Extract summary from API response structure
        let summaryText = '';
        if (response.data && response.data.result && response.data.result.Output && response.data.result.Output.summary) {
          summaryText = response.data.result.Output.summary;
        } else {
          summaryText = String(response.data);
        }

        // Save summary to database
        const newSummary = await Summary.create({
          article: article._id,
          summaryText: summaryText,
        });

        processed++;
        saved++;
        console.log(`✓ Summarized article: ${article.title.substring(0, 50)}...`);

        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`✗ Error summarizing article "${article.title}":`, error.message);
        errors++;
      }
    }

    console.log(`Bulk summarization completed: ${processed} processed, ${saved} saved, ${errors} errors, ${skipped} skipped`);

    res.json({
      message: 'Bulk article summarization completed',
      result: {
        processed: processed,
        saved: saved,
        errors: errors,
        skipped: skipped,
        totalArticles: articlesWithoutSummary.length
      },
      success: true
    });

  } catch (error) {
    console.error('Error in bulk article summarization:', error);
    res.status(500).json({
      message: 'Error processing articles for summarization',
      error: error.message,
      success: false
    });
  }
};

// Get all summaries with pagination
exports.getAllSummaries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const summaries = await Summary.find()
      .populate('article', 'title url publishedAt source')
      .populate({
        path: 'article',
        populate: {
          path: 'source',
          select: 'name url'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Summary.countDocuments();

    res.json({
      message: 'Summaries retrieved successfully',
      summaries: summaries.map(summary => ({
        id: summary._id,
        article: summary.article,
        summaryText: summary.summaryText,
        generatedAt: summary.generatedAt,
        createdAt: summary.createdAt
      })),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total,
        limit: limit
      },
      success: true
    });

  } catch (error) {
    console.error('Error getting all summaries:', error);
    res.status(500).json({
      message: 'Error retrieving summaries',
      error: error.message,
      success: false
    });
  }
};

// Delete a summary
exports.deleteSummary = async (req, res) => {
  try {
    const { summaryId } = req.params;

    if (!summaryId) {
      return res.status(400).json({
        message: 'Summary ID is required',
        success: false
      });
    }

    const summary = await Summary.findByIdAndDelete(summaryId);

    if (!summary) {
      return res.status(404).json({
        message: 'Summary not found',
        success: false
      });
    }

    res.json({
      message: 'Summary deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('Error deleting summary:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid summary ID',
        success: false
      });
    }

    res.status(500).json({
      message: 'Error deleting summary',
      error: error.message,
      success: false
    });
  }
};

// Get summary statistics
exports.getSummaryStatistics = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();
    const totalSummaries = await Summary.countDocuments();
    const articlesWithContent = await Article.countDocuments({
      content: { $exists: true, $ne: '', $ne: null }
    });

    const recentSummaries = await Summary.find()
      .populate('article', 'title source')
      .populate({
        path: 'article',
        populate: {
          path: 'source',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      message: 'Summary statistics retrieved successfully',
      statistics: {
        totalArticles: totalArticles,
        totalSummaries: totalSummaries,
        articlesWithContent: articlesWithContent,
        articlesWithoutSummary: articlesWithContent - totalSummaries,
        summarizationProgress: totalArticles > 0 ? Math.round((totalSummaries / articlesWithContent) * 100) : 0
      },
      recentSummaries: recentSummaries.map(summary => ({
        id: summary._id,
        articleTitle: summary.article ? summary.article.title : 'Unknown',
        sourceName: summary.article?.source?.name || 'Unknown',
        createdAt: summary.createdAt
      })),
      success: true
    });

  } catch (error) {
    console.error('Error getting summary statistics:', error);
    res.status(500).json({
      message: 'Error retrieving summary statistics',
      error: error.message,
      success: false
    });
  }
};
