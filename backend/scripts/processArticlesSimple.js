#!/usr/bin/env node

require('dotenv').config();
const connectDB = require('../configs/db');
const Article = require('../models/Article');
const NewsSource = require('../models/NewsSource');
const fs = require('fs').promises;
const path = require('path');

async function processArticlesSimple() {
  try {
    console.log('🚀 Starting simple article processing (without summarization)...');
    
    // Connect to database
    await connectDB();
    console.log('✓ Database connected');
    
    // Read news.json file
    const newsFile = path.join(__dirname, '../data/news.json');
    const newsData = JSON.parse(await fs.readFile(newsFile, 'utf8'));
    console.log(`📄 Loaded ${newsData.length} news items`);
    
    // Filter articles with non-empty content
    const articlesWithContent = newsData.filter(item => {
      return item.content && 
             typeof item.content === 'string' && 
             item.content.trim().length > 0 &&
             item.title &&
             item.link;
    });
    
    console.log(`📊 Found ${articlesWithContent.length} articles with content`);
    
    if (articlesWithContent.length === 0) {
      console.log('❌ No articles with content found. Exiting...');
      process.exit(0);
    }
    
    let processed = 0;
    let saved = 0;
    let errors = 0;
    let skipped = 0;
    
    // Process each article
    for (const newsItem of articlesWithContent) {
      try {
        // Check if article already exists
        const existingArticle = await Article.findOne({ url: newsItem.link });
        if (existingArticle) {
          console.log(`⏭️  Skipping existing article: ${newsItem.title.substring(0, 50)}...`);
          skipped++;
          continue;
        }
        
        // Get or create news source
        let newsSource = await NewsSource.findOne({ name: newsItem.source });
        if (!newsSource) {
          newsSource = new NewsSource({
            name: newsItem.source,
            url: `https://${newsItem.source.toLowerCase().replace(/\s+/g, '')}.com`
          });
          await newsSource.save();
          console.log(`➕ Created new news source: ${newsItem.source}`);
        }
        
        // Create article (using original content, not summarized)
        const articleData = {
          source: newsSource._id,
          title: newsItem.title,
          content: newsItem.content, // Use original content
          url: newsItem.link,
          publishedAt: newsItem.publishedDate ? new Date(newsItem.publishedDate) : new Date(),
          imageUrl: newsItem.imageUrl || null
        };
        
        const article = new Article(articleData);
        await article.save();
        
        processed++;
        saved++;
        console.log(`✅ Saved article: ${newsItem.title.substring(0, 50)}...`);
        
      } catch (error) {
        console.error(`❌ Error processing article "${newsItem.title}":`, error.message);
        errors++;
      }
    }
    
    console.log('\n🎉 Processing completed!');
    console.log(`📊 Final Results:
    - Total articles with content: ${articlesWithContent.length}
    - Processed: ${processed}
    - Saved: ${saved}
    - Skipped (already exists): ${skipped}
    - Errors: ${errors}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
processArticlesSimple();
