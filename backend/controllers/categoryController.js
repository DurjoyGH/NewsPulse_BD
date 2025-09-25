const { GoogleGenerativeAI } = require("@google/generative-ai");
const Summary = require("../models/Summary");
const Category = require("../models/Category");
const SummaryCategory = require("../models/SummaryCategory");
const GEMINI_API_KEY  = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

exports.classifyNews = async (req, res) => {
  const { news_content } = req.body;

  if (!news_content) {
    return res.status(400).json({ error: "News content is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a news categorization specialist. You can analyze news content in both English and Bangla languages and classify them into appropriate categories. Always return the category classification in English keywords only, regardless of the input language. You understand context and content across languages and provide accurate categorization for various news topics.Only return most relevant single category keyword in English without any explanation or additional text. The possible categories are: Politics, Sports, Entertainment, Technology, Health, Business, World, Lifestyle, Education, Science, Environment, Travel, Food, Culture, Opinion, Religion, History, Literature.

Question: ${news_content}
Answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    if (!answer) {
      return res
        .status(500)
        .json({ error: "No valid response received from AI." });
    }

    res.json({ answer });
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    res.status(500).json({ error: "Failed to process the news_content." });
  }
};

// Function to categorize all summaries
exports.categorizeSummaries = async (req, res) => {
  try {
    console.log("Starting summary categorization process...");
    
    // Get all summaries that haven't been categorized yet
    const summaries = await Summary.find().populate('article');
    
    if (summaries.length === 0) {
      return res.json({ 
        message: "No summaries found to categorize",
        processed: 0,
        total: 0 
      });
    }

    console.log(`Found ${summaries.length} summaries to process`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    let processed = 0;
    let errors = 0;

    const prompt = `You are a news categorization specialist. You can analyze news content in both English and Bangla languages and classify them into appropriate categories. Always return the category classification in English keywords only, regardless of the input language. You understand context and content across languages and provide accurate categorization for various news topics.Only return most relevant single category keyword in English without any explanation or additional text. The possible categories are: Politics, Sports, Entertainment, Technology, Health, Business, World, Lifestyle, Education, Science, Environment, Travel, Food, Culture, Opinion, Religion, History, Literature.

Question: `;

    for (const summary of summaries) {
      try {
        // Check if this summary is already categorized
        const existingCategory = await SummaryCategory.findOne({ summary: summary._id });
        if (existingCategory) {
          console.log(`Summary ${summary._id} already categorized, skipping...`);
          continue;
        }

        // Use summary text for categorization
        const contentToClassify = summary.summaryText || summary.article?.title || '';
        
        if (!contentToClassify) {
          console.log(`No content found for summary ${summary._id}, skipping...`);
          continue;
        }

        const fullPrompt = prompt + contentToClassify + '\nAnswer:';
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const categoryName = response.text().trim();

        if (!categoryName) {
          console.log(`No category returned for summary ${summary._id}`);
          errors++;
          continue;
        }

        // Find or create the category
        let category = await Category.findOne({ 
          name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
        });
        
        if (!category) {
          category = new Category({ name: categoryName });
          await category.save();
          console.log(`Created new category: ${categoryName}`);
        }

        // Create the summary-category relationship
        const summaryCategory = new SummaryCategory({
          summary: summary._id,
          category: category._id
        });

        await summaryCategory.save();
        processed++;
        
        console.log(`Categorized summary ${summary._id} as ${categoryName} (${processed}/${summaries.length})`);

        // Add a small delay to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing summary ${summary._id}:`, error);
        errors++;
      }
    }

    res.json({
      message: "Summary categorization completed",
      total: summaries.length,
      processed,
      errors,
      success: true
    });

  } catch (error) {
    console.error("Error in categorizeSummaries:", error);
    res.status(500).json({ error: "Failed to categorize summaries" });
  }
};

// Function to get summaries by category
exports.getSummariesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const summaryCategories = await SummaryCategory.find({ category: categoryId })
      .populate({
        path: 'summary',
        populate: {
          path: 'article',
          populate: {
            path: 'source'
          }
        }
      })
      .populate('category');

    const summaries = summaryCategories.map(sc => ({
      ...sc.summary.toObject(),
      category: sc.category
    }));

    res.json({
      summaries,
      count: summaries.length
    });
  } catch (error) {
    console.error("Error getting summaries by category:", error);
    res.status(500).json({ error: "Failed to get summaries by category" });
  }
};

// Function to get all categories with summary counts
exports.getCategoriesWithCounts = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'summarycategories',
          localField: '_id',
          foreignField: 'category',
          as: 'summaries'
        }
      },
      {
        $addFields: {
          summaryCount: { $size: '$summaries' }
        }
      },
      {
        $project: {
          name: 1,
          summaryCount: 1,
          createdAt: 1
        }
      },
      {
        $sort: { summaryCount: -1 }
      }
    ]);

    res.json({
      categories,
      total: categories.length
    });
  } catch (error) {
    console.error("Error getting categories with counts:", error);
    res.status(500).json({ error: "Failed to get categories with counts" });
  }
};