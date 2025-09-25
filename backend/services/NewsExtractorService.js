const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const { NEWS_SOURCES } = require('../configs/newsSources');

class NewsExtractorService {
  constructor() {
    this.parser = new Parser();
    this.sourceHandlers = {
      'rss': this.handleRSSSource.bind(this),
      'web': this.handleWebSource.bind(this),
      'auto': this.handleAutoDetection.bind(this)
    };
  }

  async extractAllSources() {
    const allNews = [];
    
    // Extract from all auto-detection sources
    for (const source of NEWS_SOURCES.phase1_auto) {
      if (!source.active) continue;
      
      try {
        console.log(`\n📰 Processing: ${source.name} (${source.url})`);
        const newsItems = await this.extractFromSource(source);
        allNews.push(...newsItems);
        console.log(`✅ Found ${newsItems.length} articles from ${source.name}`);
      } catch (error) {
        console.error(`❌ Error extracting from ${source.name}:`, error.message);
      }
    }

    return allNews;
  }

  // New method to extract from a simple URL with auto-detection
  async extractFromUrl(url, sourceName = null, category = 'general') {
    const source = {
      name: sourceName || this.extractDomainName(url),
      type: 'auto',
      url: url,
      category: category,
      active: true
    };

    return await this.handleAutoDetection(source);
  }

  // Extract domain name from URL for source naming
  extractDomainName(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '').split('.')[0];
    } catch (error) {
      return 'Unknown Source';
    }
  }

  async extractFromSource(source) {
    const handler = this.sourceHandlers[source.type];
    if (!handler) {
      throw new Error(`No handler for source type: ${source.type}`);
    }
    return await handler(source);
  }

  // New method to handle auto-detection of feed type
  async handleAutoDetection(source) {
    try {
      console.log(`Auto-detecting feed type for: ${source.name} (${source.url})`);
      
      // First, try to detect RSS feeds
      const rssUrls = await this.detectRSSFeeds(source.url);
      
      if (rssUrls.length > 0) {
        console.log(`✅ RSS feed detected for ${source.name}: ${rssUrls[0]}`);
        // Use the first RSS feed found
        const rssSource = {
          ...source,
          url: rssUrls[0],
          type: 'rss'
        };
        return await this.handleRSSSource(rssSource);
      } else {
        console.log(`❌ No RSS feed found for ${source.name}, falling back to web scraping`);
        // Fall back to web scraping
        const webSource = {
          ...source,
          type: 'web',
          scrapingConfig: this.generateGenericScrapingConfig()
        };
        return await this.handleGenericWebSource(webSource);
      }
    } catch (error) {
      console.error(`Auto-detection error for ${source.url}:`, error.message);
      return [];
    }
  }

  // Method to detect RSS feeds from a website
  async detectRSSFeeds(baseUrl) {
    const rssUrls = [];
    
    try {
      // Common RSS feed patterns to check
      const commonRssPaths = [
        '/rss.xml',
        '/rss',
        '/feed.xml', 
        '/feed',
        '/feeds/all.atom.xml',
        '/atom.xml',
        '/index.xml'
      ];

      // First, try common RSS paths
      for (const path of commonRssPaths) {
        const rssUrl = new URL(path, baseUrl).toString();
        if (await this.isValidRSSFeed(rssUrl)) {
          rssUrls.push(rssUrl);
          break; // Use the first valid RSS feed found
        }
      }

      // If no direct RSS found, check the HTML for RSS links
      if (rssUrls.length === 0) {
        const foundFeeds = await this.findRSSLinksInHTML(baseUrl);
        rssUrls.push(...foundFeeds);
      }

    } catch (error) {
      console.error(`Error detecting RSS feeds for ${baseUrl}:`, error.message);
    }

    return rssUrls;
  }

  // Check if a URL is a valid RSS feed
  async isValidRSSFeed(url) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
        }
      });

      const contentType = response.headers['content-type'] || '';
      const content = response.data;

      // Check content type
      if (contentType.includes('xml') || contentType.includes('rss') || contentType.includes('atom')) {
        return true;
      }

      // Check content for RSS/Atom markers
      if (typeof content === 'string') {
        return content.includes('<rss') || 
               content.includes('<feed') || 
               content.includes('<channel>') ||
               content.includes('xmlns="http://www.w3.org/2005/Atom"');
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  // Find RSS links in HTML
  async findRSSLinksInHTML(baseUrl) {
    const rssUrls = [];
    
    try {
      const response = await axios.get(baseUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Look for RSS links in HTML
      $('link[type*="rss"], link[type*="atom"], link[href*="rss"], link[href*="feed"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const fullUrl = this.resolveUrl(href, baseUrl);
          rssUrls.push(fullUrl);
        }
      });

      // Also check for common RSS link text
      $('a[href*="rss"], a[href*="feed"]').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().toLowerCase();
        if (href && (text.includes('rss') || text.includes('feed'))) {
          const fullUrl = this.resolveUrl(href, baseUrl);
          rssUrls.push(fullUrl);
        }
      });

    } catch (error) {
      console.error(`Error finding RSS links in HTML for ${baseUrl}:`, error.message);
    }

    return rssUrls;
  }

  // Generic web scraping config for common news sites
  generateGenericScrapingConfig() {
    return {
      articleSelector: 'article, .article, .news-item, .post, .story, .entry',
      titleSelector: 'h1, h2, h3, .title, .headline, .article-title, .news-title, .post-title',
      descriptionSelector: '.excerpt, .summary, .description, .lead, .intro, .article-excerpt, p:first-of-type',
      contentSelector: '.content, .article-content, .post-content, .news-content, .story-content, .entry-content',
      linkSelector: 'a',
      dateSelector: '.date, .publish-date, .article-date, .post-date, time, .timestamp'
    };
  }

  // Generic web source handler
  async handleGenericWebSource(source) {
    try {
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
        }
      });
      
      const $ = cheerio.load(response.data);
      const config = source.scrapingConfig;
      const newsItems = [];

      // Try multiple selectors to find articles
      const selectors = config.articleSelector.split(', ');
      let foundArticles = false;

      for (const selector of selectors) {
        const articles = $(selector);
        if (articles.length > 0) {
          foundArticles = true;
          
          // Process articles sequentially to handle async content fetching
          for (let index = 0; index < Math.min(articles.length, 10); index++) {
            const element = articles[index];
            const $article = $(element);
            
            // Try multiple title selectors
            let title = '';
            const titleSelectors = config.titleSelector.split(', ');
            for (const titleSel of titleSelectors) {
              title = $article.find(titleSel).first().text().trim();
              if (title) break;
            }
            
            // Try multiple description selectors
            let description = '';
            const descSelectors = config.descriptionSelector.split(', ');
            for (const descSel of descSelectors) {
              description = $article.find(descSel).first().text().trim();
              if (description && description.length > 50) break;
            }
            
            // Try multiple content selectors
            let content = '';
            const contentSelectors = config.contentSelector.split(', ');
            for (const contentSel of contentSelectors) {
              content = $article.find(contentSel).first().text().trim();
              if (content && content.length > description.length) break;
            }
            
            // Get link
            let link = $article.find('a').first().attr('href') || 
                      $article.find(config.linkSelector).first().attr('href') || '';

            if (title && title.length > 10) {
              const fullLink = link ? this.resolveUrl(link, source.url) : source.url;
              
              // Enhanced content extraction with truncation detection and "See more" link following
              if (link && this.isContentTruncated(content || description)) {
                console.log(`🔍 Content appears truncated, fetching complete article: ${title.substring(0, 50)}...`);
                try {
                  const completeContent = await this.extractCompleteArticleContent(fullLink);
                  if (completeContent && completeContent.length > (content || '').length) {
                    content = completeContent;
                    console.log(`✅ Complete content extracted: ${content.length} characters`);
                  } else {
                    // Fallback to basic full article extraction
                    const fallbackContent = await this.fetchFullArticleContent(fullLink);
                    if (fallbackContent && fallbackContent.length > (content || '').length) {
                      content = fallbackContent;
                      console.log(`📄 Fallback content extracted: ${content.length} characters`);
                    }
                  }
                } catch (error) {
                  console.log(`⚠️ Could not enhance content for: ${title.substring(0, 30)}... (${error.message})`);
                }
              } else if (link && (!content || content.length < 300)) {
                // Basic content extraction for very short content
                console.log(`📄 Fetching basic full content for: ${title.substring(0, 50)}...`);
                const fullArticleContent = await this.fetchFullArticleContent(fullLink);
                if (fullArticleContent && fullArticleContent.length > (content || '').length) {
                  content = fullArticleContent;
                  console.log(`✅ Enhanced content length: ${content.length} chars`);
                }
              }
              
              newsItems.push({
                id: this.generateId(fullLink || title + Date.now()),
                source: source.name,
                sourceType: 'web',
                category: source.category || 'general',
                title,
                description: description || title,
                content: content || description || title,
                link: fullLink,
                publishedDate: new Date(),
                author: '',
                categories: [],
                extractedAt: new Date(),
                isRead: false,
                isFavorite: false
              });
            }
          }
          break; // Stop after finding articles with the first working selector
        }
      }      if (!foundArticles) {
        console.warn(`No articles found for ${source.name} with generic selectors`);
      }

      return newsItems;
    } catch (error) {
      console.error(`Generic web scraping error for ${source.url}:`, error);
      return [];
    }
  }

  async handleRSSSource(source) {
    try {
      const feed = await this.parser.parseURL(source.url);
      
      const newsItems = [];
      
      for (const item of feed.items.slice(0, 10)) { // Limit to first 10 items to avoid overwhelming requests
        const baseNewsItem = {
          id: this.generateId(item.link || item.guid),
          source: source.name,
          sourceType: 'rss',
          category: source.category,
          title: item.title || '',
          description: this.cleanDescription(item.contentSnippet || item.description || ''),
          link: item.link || '',
          publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          author: item.creator || item.author || '',
          categories: item.categories || [],
          extractedAt: new Date(),
          isRead: false,
          isFavorite: false
        };

        // Try to get full content from RSS first
        let fullContent = this.cleanContent(item.content || item['content:encoded'] || '');
        
        // Enhanced detection for truncated content
        const isTruncated = this.isContentTruncated(fullContent, item.contentSnippet || item.description || '');
        
        if (isTruncated && item.link) {
          console.log(`📄 Detecting truncated content for: ${baseNewsItem.title.substring(0, 50)}...`);
          const completeArticleContent = await this.extractCompleteArticleContent(item.link);
          if (completeArticleContent && completeArticleContent.length > fullContent.length) {
            fullContent = completeArticleContent;
            console.log(`✅ Complete content extracted: ${fullContent.length} chars`);
          }
        }
        
        baseNewsItem.content = fullContent || baseNewsItem.description;
        newsItems.push(baseNewsItem);
      }

      return newsItems;
    } catch (error) {
      console.error(`RSS parsing error for ${source.url}:`, error);
      return [];
    }
  }

  async handleWebSource(source) {
    // Phase 2 implementation
    try {
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
        }
      });
      
      const $ = cheerio.load(response.data);
      const config = source.scrapingConfig;
      const newsItems = [];

      const articleElements = $(config.articleSelector).slice(0, 10); // Limit to 10 articles
      
      for (let index = 0; index < articleElements.length; index++) {
        const element = articleElements[index];
        const $article = $(element);
        const title = $article.find(config.titleSelector).text().trim();
        const description = $article.find(config.descriptionSelector).text().trim();
        const link = $article.find(config.linkSelector).attr('href');
        const publishedDate = $article.find(config.dateSelector).text().trim();

        if (title && link) {
          const resolvedLink = this.resolveUrl(link, source.url);
          let content = $article.find(config.contentSelector || config.descriptionSelector).text().trim();
          
          // Check if content appears truncated and fetch complete content
          if (this.isContentTruncated(content) && resolvedLink) {
            console.log(`🔍 Web scraping - content appears truncated, fetching complete article: ${title.substring(0, 50)}...`);
            try {
              const completeContent = await this.extractCompleteArticleContent(resolvedLink);
              if (completeContent && completeContent.length > content.length) {
                console.log(`✅ Web scraping - enhanced content from ${content.length} to ${completeContent.length} characters`);
                content = completeContent;
              }
            } catch (error) {
              console.log(`⚠️ Could not enhance web scraped content for: ${title.substring(0, 30)}... (${error.message})`);
            }
          }

          newsItems.push({
            id: this.generateId(resolvedLink),
            source: source.name,
            sourceType: 'web',
            category: source.category,
            title,
            description,
            content: this.cleanContent(content),
            link: resolvedLink,
            publishedDate: this.parseDate(publishedDate) || new Date(),
            extractedAt: new Date(),
            isRead: false,
            isFavorite: false
          });
        }
      }

      return newsItems;
    } catch (error) {
      console.error(`Web scraping error for ${source.url}:`, error);
      return [];
    }
  }

  async handleSocialSource(source) {
    // Phase 3 implementation placeholder
    const platform = source.platform;
    
    switch (platform) {
      case 'facebook':
        return await this.handleFacebookSource(source);
      case 'youtube':
        return await this.handleYouTubeSource(source);
      case 'telegram':
        return await this.handleTelegramSource(source);
      default:
        return [];
    }
  }

  async handleFacebookSource(source) {
    // Implement Facebook Graph API integration
    return [];
  }

  async handleYouTubeSource(source) {
    // Implement YouTube Data API integration
    return [];
  }

  async handleTelegramSource(source) {
    // Implement Telegram Bot API integration
    return [];
  }

  generateId(url) {
    return Buffer.from(url).toString('base64').substring(0, 16);
  }

  // Enhanced method to detect if content is truncated
  isContentTruncated(content, description = '') {
    if (!content || content.length < 200) return true;
    
    // Common truncation indicators
    const truncationPatterns = [
      /\.{3,}$/,                    // Ends with ellipsis (...)
      /\s*see\s+more\s*$/i,        // Ends with "See more"
      /\s*read\s+more\s*$/i,       // Ends with "Read more"
      /\s*continue\s+reading\s*$/i, // Ends with "Continue reading"
      /\s*details\s*$/i,           // Ends with "Details"
      /\s*বিস্তারিত\s*$/,           // Ends with "বিস্তারিত" (Bangla)
      /\s*আরো\s+পড়ুন\s*$/,         // Ends with "আরো পড়ুন" (Bangla)
      /\s*সম্পূর্ণ\s+খবর\s*$/,       // Ends with "সম্পূর্ণ খবর" (Bangla)
      /\s*পূর্ণাঙ্গ\s+সংবাদ\s*$/,    // Ends with "পূর্ণাঙ্গ সংবাদ" (Bangla)
      /\[\.{3}\]$/,                // Ends with [...]
      /\s*\[more\]\s*$/i,          // Ends with [more]
      /\s*click\s+here\s*$/i,      // Ends with "Click here"
      /\s*full\s+story\s*$/i,      // Ends with "Full story"
    ];
    
    // Check if content ends with truncation patterns
    for (const pattern of truncationPatterns) {
      if (pattern.test(content.trim())) {
        return true;
      }
    }
    
    // Check if content is significantly shorter than typical articles
    if (content.length < 500 && content.split(' ').length < 100) {
      return true;
    }
    
    // Check if content seems incomplete (doesn't end with proper punctuation)
    const lastChar = content.trim().slice(-1);
    if (content.length < 1000 && !['.', '!', '?', '।', '|'].includes(lastChar)) {
      return true;
    }
    
    return false;
  }

  // Enhanced method to extract complete article content by following "See more" links
  async extractCompleteArticleContent(articleUrl) {
    try {
      const response = await axios.get(articleUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Step 1: Look for "See more" or "Read more" buttons/links
      const expandLinks = this.findExpandableContentLinks($);
      
      // Step 2: If expandable links found, try to get content via them
      let expandedContent = '';
      if (expandLinks.length > 0) {
        console.log(`🔗 Found ${expandLinks.length} expandable content links`);
        for (const link of expandLinks.slice(0, 2)) { // Try first 2 links
          const additionalContent = await this.fetchExpandedContent(link, articleUrl);
          if (additionalContent) {
            expandedContent += additionalContent + '\n\n';
          }
        }
      }
      
      // Step 3: Extract main article content using enhanced selectors
      const mainContent = this.extractMainArticleContent($);
      
      // Step 4: Combine and return the most complete content
      const completeContent = expandedContent + mainContent;
      
      return this.cleanContent(completeContent);
      
    } catch (error) {
      console.error(`Error extracting complete content from ${articleUrl}:`, error.message);
      return '';
    }
  }

  // Find expandable content links (See more, Read more, etc.)
  findExpandableContentLinks($) {
    const expandLinks = [];
    const expandPatterns = [
      'a[href*="read-more"]',
      'a[href*="see-more"]', 
      'a[href*="full-story"]',
      'a[href*="continue"]',
      'a:contains("See more")',
      'a:contains("Read more")',
      'a:contains("Continue reading")',
      'a:contains("Full story")',
      'a:contains("Details")',
      'a:contains("বিস্তারিত")',
      'a:contains("আরো পড়ুন")',
      'a:contains("সম্পূর্ণ খবর")',
      'button[data-more]',
      'button:contains("Show more")',
      '.read-more a',
      '.see-more a',
      '.expand-content a',
      '[data-toggle="collapse"]',
      '[data-expand]'
    ];
    
    expandPatterns.forEach(pattern => {
      $(pattern).each((i, elem) => {
        const href = $(elem).attr('href');
        const onclick = $(elem).attr('onclick');
        const dataUrl = $(elem).attr('data-url');
        
        if (href || onclick || dataUrl) {
          expandLinks.push({
            element: elem,
            href: href,
            onclick: onclick,
            dataUrl: dataUrl,
            text: $(elem).text().trim()
          });
        }
      });
    });
    
    return expandLinks;
  }

  // Fetch content from expandable links
  async fetchExpandedContent(linkInfo, baseUrl) {
    try {
      let targetUrl = '';
      
      if (linkInfo.href && linkInfo.href.startsWith('http')) {
        targetUrl = linkInfo.href;
      } else if (linkInfo.href) {
        targetUrl = new URL(linkInfo.href, baseUrl).toString();
      } else if (linkInfo.dataUrl) {
        targetUrl = linkInfo.dataUrl.startsWith('http') ? 
          linkInfo.dataUrl : new URL(linkInfo.dataUrl, baseUrl).toString();
      } else {
        return '';
      }
      
      console.log(`🔍 Fetching expanded content from: ${targetUrl}`);
      
      const response = await axios.get(targetUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      return this.extractMainArticleContent($);
      
    } catch (error) {
      console.error(`Error fetching expanded content: ${error.message}`);
      return '';
    }
  }

  // Extract main article content with enhanced selectors
  extractMainArticleContent($) {
    // Enhanced content selectors for different news sites
    const contentSelectors = [
      // Main content containers
      'article .content, article .article-content, article .post-content, article .entry-content',
      '.article-body, .story-body, .news-content, .post-body, .content-body',
      '.article-text, .story-content, .news-article-content',
      
      // Specific news site selectors
      '.story-element-text, .story-card__details', // Prothom Alo
      '.news_details, .news-detail-content, .single-news-content', // Bangla news sites
      '.article__content, .article__body, .news-item-content',
      '[data-module="ArticleBody"], [data-component="ArticleBody"]',
      
      // Generic content areas
      'main .content, .main-content, #content .article',
      '.container .article-content, .wrapper .post-content',
      
      // Fallback selectors
      '.content p, .article p, .story p',
      'main p, #main p'
    ];

    let fullContent = '';
    
    for (const selector of contentSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((i, elem) => {
          const text = $(elem).text().trim();
          if (text && text.length > 100) {
            fullContent += text + '\n\n';
          }
        });
        
        // If we found substantial content, break
        if (fullContent.length > 1000) break;
      }
    }

    // If still no good content, try paragraph extraction
    if (fullContent.length < 500) {
      $('p').each((i, elem) => {
        const text = $(elem).text().trim();
        // Filter out navigation, ads, and other non-content paragraphs
        if (text && text.length > 50 && 
            !text.toLowerCase().includes('cookie') &&
            !text.toLowerCase().includes('subscribe') &&
            !text.toLowerCase().includes('advertisement') &&
            !text.toLowerCase().includes('follow us') &&
            !text.toLowerCase().includes('share this')) {
          fullContent += text + '\n\n';
        }
      });
    }

    return fullContent;
  }

  // Method to fetch full article content from individual article URLs
  async fetchFullArticleContent(articleUrl) {
    try {
      const response = await axios.get(articleUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Enhanced content selectors for different news sites
      const contentSelectors = [
        // Generic article content selectors
        'article .content, article .article-content, article .post-content',
        '.article-body, .story-body, .news-content, .post-body',
        '.entry-content, .article-text, .story-content',
        '[data-module="ArticleBody"], [data-component="ArticleBody"]',
        '.article p, .story p, .content p',
        
        // Specific site selectors
        '.story-card__details, .story-element-text', // Prothom Alo
        '.news_details, .news-detail-content', // Bangla news sites
        '.single-news-content, .news-item-content',
        '.article__content, .article__body',
        '.post-content p, .entry p',
        
        // Fallback selectors
        'main p, .main-content p, #content p',
        '.container p, .wrapper p'
      ];

      let fullContent = '';
      
      for (const selector of contentSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          // Extract text from all matching elements
          elements.each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && text.length > 50) { // Only add meaningful content
              fullContent += text + '\n\n';
            }
          });
          
          // If we found substantial content, break
          if (fullContent.length > 1000) break;
        }
      }

      // If no specific content found, try to get all paragraphs
      if (fullContent.length < 500) {
        $('p').each((i, elem) => {
          const text = $(elem).text().trim();
          // Filter out navigation, ads, and other non-content paragraphs
          if (text && text.length > 30 && 
              !text.toLowerCase().includes('cookie') &&
              !text.toLowerCase().includes('subscribe') &&
              !text.toLowerCase().includes('advertisement') &&
              !text.toLowerCase().includes('follow us')) {
            fullContent += text + '\n\n';
          }
        });
      }

      // Clean and process the content
      fullContent = this.cleanContent(fullContent);
      
      // Remove duplicate sentences and clean up
      const sentences = fullContent.split('.').filter(s => s.trim().length > 20);
      const uniqueSentences = [...new Set(sentences)];
      fullContent = uniqueSentences.join('. ').trim();

      return fullContent;
    } catch (error) {
      console.error(`Error fetching full content from ${articleUrl}:`, error.message);
      return '';
    }
  }

  cleanDescription(description) {
    return description.replace(/<[^>]*>/g, '').substring(0, 500);
  }

  cleanContent(content) {
    if (!content) return '';
    
    // Remove HTML tags but keep the full content
    let cleanedContent = content.replace(/<[^>]*>/g, '').trim();
    
    // Remove common unwanted text patterns
    const unwantedPatterns = [
      /advertisement\s*/gi,
      /subscribe\s*to\s*our\s*newsletter/gi,
      /follow\s*us\s*on/gi,
      /share\s*this\s*article/gi,
      /click\s*here\s*to/gi,
      /read\s*more\s*:/gi,
      /see\s*also\s*:/gi,
      /related\s*articles\s*:/gi,
      /©\s*\d{4}\s*.*$/gi,
      /all\s*rights\s*reserved/gi,
      /cookie\s*policy/gi,
      /privacy\s*policy/gi
    ];
    
    unwantedPatterns.forEach(pattern => {
      cleanedContent = cleanedContent.replace(pattern, '');
    });
    
    // Clean up extra whitespace and line breaks
    cleanedContent = cleanedContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    
    return cleanedContent;
  }

  resolveUrl(link, baseUrl) {
    if (link.startsWith('http')) return link;
    const base = new URL(baseUrl);
    return new URL(link, base.origin).toString();
  }

  parseDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }
}

module.exports = NewsExtractorService;