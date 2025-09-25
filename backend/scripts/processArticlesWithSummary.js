#!/usr/bin/env node

require('dotenv').config();
const connectDB = require('../configs/db');
const ArticleProcessingService = require('../services/ArticleProcessingService');

async function processArticlesWithSummarization() {
  try {
    console.log('🚀 Starting article processing with summarization...');
    
    // Connect to database
    await connectDB();
    console.log('✓ Database connected');
    
    // Initialize processing service
    const articleService = new ArticleProcessingService();
    
    // Get statistics first
    console.log('\n📊 Getting news statistics...');
    const stats = await articleService.getNewsStatistics();
    console.log('Statistics:', stats);
    
    if (stats.withContent === 0) {
      console.log('❌ No articles with content found. Exiting...');
      process.exit(0);
    }
    
    console.log(`\n🔄 Processing ${stats.withContent} articles with summarization...`);
    console.log('⚠️  This may take a while as each article needs to be summarized...');
    
    // Process all news and save as articles (with summarization)
    const result = await articleService.processNewsAndSaveArticles();
    
    console.log('\n✅ Processing with summarization completed!');
    console.log(`📈 Results:
    - Processed: ${result.processed}
    - Saved: ${result.saved}
    - Errors: ${result.errors}`);
    
    if (result.errors > 0) {
      console.log('⚠️  Some articles had summarization errors but were saved with original content');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error running article processing with summarization:', error);
    process.exit(1);
  }
}

// Run the script
processArticlesWithSummarization();
