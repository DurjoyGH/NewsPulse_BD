#!/usr/bin/env node

require('dotenv').config();
const connectDB = require('../configs/db');
const axios = require('axios');
const Article = require('../models/Article');
const Summary = require('../models/Summary');
const NewsSource = require('../models/NewsSource');

const SUMMARIZE_API_URL = 'https://cmfyvn5v38dg62py5l86k12a1.agent.a.smyth.ai/api/summarize_bengali';

async function processArticlesToSummaries() {
  try {
    console.log('🚀 Starting article to summary processing...');
    
    // Connect to database
    await connectDB();
    console.log('✓ Database connected');
    
    // Get all articles that don't have summaries yet
    const articlesWithoutSummary = await Article.find({
      _id: { 
        $nin: await Summary.distinct('article')
      },
      content: { $exists: true, $ne: '', $ne: null }
    }).populate('source', 'name');

    console.log(`📊 Found ${articlesWithoutSummary.length} articles without summaries`);

    if (articlesWithoutSummary.length === 0) {
      console.log('✅ All articles already have summaries');
      process.exit(0);
    }

    let processed = 0;
    let saved = 0;
    let errors = 0;
    let skipped = 0;

    console.log(`\n🔄 Processing ${articlesWithoutSummary.length} articles...`);

    // Process each article
    for (let i = 0; i < articlesWithoutSummary.length; i++) {
      const article = articlesWithoutSummary[i];
      
      try {
        console.log(`\n[${i + 1}/${articlesWithoutSummary.length}] Processing: ${article.title.substring(0, 60)}...`);

        // Check if content is valid
        if (!article.content || article.content.trim().length < 50) {
          console.log(`⏭️  Skipping - content too short (${article.content?.length || 0} chars)`);
          skipped++;
          continue;
        }

        // Call summarization API
        console.log('📡 Calling summarization API...');
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
          console.log('⚠️  Unexpected API response structure:', JSON.stringify(response.data, null, 2));
          summaryText = String(response.data);
        }

        if (!summaryText || summaryText.trim().length === 0) {
          console.log('⚠️  API returned empty summary');
          errors++;
          continue;
        }

        // Save summary to database
        const newSummary = await Summary.create({
          article: article._id,
          summaryText: summaryText,
        });

        processed++;
        saved++;
        console.log(`✅ Summary created successfully (ID: ${newSummary._id})`);
        console.log(`📝 Summary: ${summaryText.substring(0, 100)}...`);

        // Add delay to avoid overwhelming the API
        if (i < articlesWithoutSummary.length - 1) {
          console.log('⏳ Waiting 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ Error processing article:`, error.message);
        if (error.response) {
          console.error(`   API Response:`, error.response.status, error.response.data);
        }
        errors++;
        
        // Continue with next article after API errors
        if (error.code === 'ECONNABORTED') {
          console.log('   Timeout occurred, continuing with next article...');
        }
      }
    }

    console.log('\n🎉 Processing completed!');
    console.log(`📊 Final Results:
    - Total articles to process: ${articlesWithoutSummary.length}
    - Successfully processed: ${processed}
    - Summaries saved: ${saved}
    - Skipped (short content): ${skipped}
    - Errors: ${errors}`);

    // Show final statistics
    const totalSummaries = await Summary.countDocuments();
    const totalArticles = await Article.countDocuments();
    
    console.log(`\n📈 Database Summary:
    - Total articles in DB: ${totalArticles}
    - Total summaries in DB: ${totalSummaries}
    - Coverage: ${Math.round((totalSummaries / totalArticles) * 100)}%`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
processArticlesToSummaries();
