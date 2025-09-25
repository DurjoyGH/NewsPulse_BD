#!/usr/bin/env node

require('dotenv').config();
const connectDB = require('./configs/db');
const ArticleProcessingService = require('./services/ArticleProcessingService');

async function runArticleProcessing() {
  try {
    console.log('🚀 Starting article processing script...');
    
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
    
    console.log(`\n🔄 Processing ${stats.withContent} articles with content...`);
    
    // Process all news and save as articles
    const result = await articleService.processNewsAndSaveArticles();
    
    console.log('\n✅ Processing completed!');
    console.log(`📈 Results:
    - Processed: ${result.processed}
    - Saved: ${result.saved}
    - Errors: ${result.errors}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error running article processing:', error);
    process.exit(1);
  }
}

// Run the script
runArticleProcessing();
