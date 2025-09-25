// Most Authentic & Popular Bangladesh News Sources
const NEWS_SOURCES = {
  phase1_auto: [
    // Tier 1: Most Credible & Popular Bangladeshi News Sources
    {
      name: 'Prothom Alo',
      type: 'auto',
      url: 'https://www.prothomalo.com',
      category: 'general',
      active: true,
      credibility: 'high',
      readership: 'very-high',
      description: 'Most popular Bengali daily newspaper in Bangladesh'
    },
    {
      name: 'The Daily Star',
      type: 'auto',
      url: 'https://www.thedailystar.net',
      category: 'general',
      active: true,
      credibility: 'high',
      readership: 'high',
      description: 'Leading English daily newspaper, established credibility'
    },
    {
      name: 'Kaler Kantho',
      type: 'auto',
      url: 'https://www.kalerkantho.com',
      category: 'general',
      active: true,
      credibility: 'high',
      readership: 'very-high',
      description: 'Second most popular Bengali daily, wide readership'
    },
    {
      name: 'Jugantor',
      type: 'auto',
      url: 'https://www.jugantor.com',
      category: 'general',
      active: true,
      credibility: 'high',
      readership: 'high',
      description: 'One of the oldest and most trusted Bengali newspapers'
    },
    {
      name: 'Ittefaq',
      type: 'auto',
      url: 'https://www.ittefaq.com.bd',
      category: 'general',
      active: true,
      credibility: 'high',
      readership: 'high',
      description: 'Historic newspaper, established 1949, strong credibility'
    },
    {
      name: 'Samakal',
      type: 'auto',
      url: 'https://samakal.com',
      category: 'general',
      active: true,
      credibility: 'high',
      readership: 'high',
      description: 'Popular Bengali daily with strong political coverage'
    },
    {
      name: 'BD News24',
      type: 'auto',
      url: 'https://bdnews24.com',
      category: 'general',
      active: true,
      credibility: 'high',
      readership: 'high',
      description: 'Leading online news portal, bilingual content'
    },
    {
      name: 'Dhaka Tribune',
      type: 'auto',
      url: 'https://dhakatribune.com',
      category: 'general',
      active: true,
      credibility: 'high',
      readership: 'medium',
      description: 'Quality English newspaper, good international coverage'
    },
    
    // Tier 2: Popular & Reliable Sources
    {
      name: 'Jago News',
      type: 'auto',
      url: 'https://www.jagonews24.com',
      category: 'general',
      active: true,
      credibility: 'medium-high',
      readership: 'high',
      description: 'Popular online news portal, fast breaking news'
    },
    {
      name: 'Bangla Tribune',
      type: 'auto',
      url: 'https://banglatribune.com',
      category: 'general',
      active: true,
      credibility: 'medium-high',
      readership: 'medium',
      description: 'Modern news portal with good digital presence'
    },
    {
      name: 'New Age Bangladesh',
      type: 'auto',
      url: 'https://www.newagebd.net',
      category: 'general',
      active: true,
      credibility: 'medium-high',
      readership: 'medium',
      description: 'Independent English daily, good editorial content'
    },
    {
      name: 'Bangla News24',
      type: 'auto',
      url: 'https://banglanews24.com',
      category: 'general',
      active: true,
      credibility: 'medium-high',
      readership: 'medium',
      description: 'Online news portal with wide coverage'
    },
    {
      name: 'Manab Zamin',
      type: 'auto',
      url: 'https://mzamin.com',
      category: 'general',
      active: true,
      credibility: 'medium-high',
      readership: 'medium',
      description: 'Popular Bengali daily newspaper'
    },
    {
      name: 'Naya Diganta',
      type: 'auto',
      url: 'https://www.nayadiganta.com',
      category: 'general',
      active: true,
      credibility: 'medium',
      readership: 'medium',
      description: 'Bengali daily with conservative viewpoint'
    },
    {
      name: 'Bonik Barta',
      type: 'auto',
      url: 'https://bonikbarta.net',
      category: 'business',
      active: true,
      credibility: 'high',
      readership: 'medium',
      description: 'Leading Bengali business newspaper'
    },
    
    // Business & Economic News
    {
      name: 'The Financial Express',
      type: 'auto',
      url: 'https://thefinancialexpress.com.bd',
      category: 'business',
      active: true,
      credibility: 'high',
      readership: 'medium',
      description: 'Premier English business daily'
    },
    {
      name: 'The Business Standard',
      type: 'auto',
      url: 'https://www.tbsnews.net',
      category: 'business',
      active: true,
      credibility: 'high',
      readership: 'medium',
      description: 'Leading business news portal'
    },
    {
      name: 'Bangladesh Sangbad Sangstha (BSS)',
      type: 'auto',
      url: 'https://www.bssnews.net',
      category: 'general',
      active: true,
      credibility: 'high',
      readership: 'medium',
      description: 'National news agency of Bangladesh'
    },
    
    // Sports News
    {
      name: 'Bangladesh Pratidin',
      type: 'auto',
      url: 'https://www.bd-pratidin.com',
      category: 'general',
      active: true,
      credibility: 'medium-high',
      readership: 'high',
      description: 'Popular Bengali daily with strong sports coverage'
    },
    {
      name: 'Dainik Inqilab',
      type: 'auto',
      url: 'https://www.dailyinqilab.com',
      category: 'general',
      active: true,
      credibility: 'medium',
      readership: 'medium',
      description: 'Established Bengali daily newspaper'
    },
    
    // Regional & Online Sources
    {
      name: 'Dhaka Post',
      type: 'auto',
      url: 'https://www.dhakapost.com',
      category: 'general',
      active: true,
      credibility: 'medium',
      readership: 'medium',
      description: 'English language news portal'
    },
    {
      name: 'Channel i Online',
      type: 'auto',
      url: 'https://www.channelionline.com',
      category: 'general',
      active: true,
      credibility: 'medium',
      readership: 'medium',
      description: 'Online portal of popular TV channel'
    },
    {
      name: 'Somoy News',
      type: 'auto',
      url: 'https://www.somoynews.tv',
      category: 'general',
      active: true,
      credibility: 'medium',
      readership: 'medium',
      description: 'News portal of Somoy TV'
    },
    {
      name: 'ATN News',
      type: 'auto',
      url: 'https://www.atnnews.tv',
      category: 'general',
      active: true,
      credibility: 'medium',
      readership: 'medium',
      description: 'News portal of ATN Bangla TV'
    },
    {
      name: 'Channel 24',
      type: 'auto',
      url: 'https://www.channel24bd.tv',
      category: 'general',
      active: true,
      credibility: 'medium',
      readership: 'medium',
      description: 'News portal of Channel 24 TV'
    },
    
    // International Sources for Context
    {
      name: 'BBC Bangla',
      type: 'auto',
      url: 'https://www.bbc.com/bengali',
      category: 'international',
      active: true,
      credibility: 'very-high',
      readership: 'high',
      description: 'BBC Bengali service, highly credible'
    },
    {
      name: 'Voice of America Bangla',
      type: 'auto',
      url: 'https://www.voabangla.com',
      category: 'international',
      active: true,
      credibility: 'high',
      readership: 'medium',
      description: 'VOA Bengali service'
    },
    {
      name: 'Deutsche Welle Bangla',
      type: 'auto',
      url: 'https://www.dw.com/bn',
      category: 'international',
      active: true,
      credibility: 'high',
      readership: 'medium',
      description: 'Deutsche Welle Bengali service'
    }
  ]
};

// Specialized & Additional Sources
const ADDITIONAL_SOURCES = {
  technology: [
    {
      name: 'TechShohor',
      type: 'auto',
      url: 'https://techshohor.com',
      category: 'technology',
      active: true,
      credibility: 'medium',
      readership: 'low',
      description: 'Bengali technology news portal'
    }
  ],
  entertainment: [
    {
      name: 'Dhallywood24',
      type: 'auto',
      url: 'https://dhallywood24.com',
      category: 'entertainment',
      active: false,
      credibility: 'medium',
      readership: 'low',
      description: 'Bengali entertainment news'
    }
  ],
  sports: [
    {
      name: 'Cricfrenzy',
      type: 'auto',
      url: 'https://www.cricfrenzy.com',
      category: 'sports',
      active: false,
      credibility: 'medium',
      readership: 'low',
      description: 'Cricket and sports news'
    }
  ],
  regional: [
    {
      name: 'Sylhet Mirror',
      type: 'auto',
      url: 'https://sylhetmirror.com',
      category: 'regional',
      active: false,
      credibility: 'medium',
      readership: 'low',
      description: 'Sylhet regional news'
    },
    {
      name: 'Chittagong Times',
      type: 'auto',
      url: 'https://ctgtimes.com',
      category: 'regional',
      active: false,
      credibility: 'medium',
      readership: 'low',
      description: 'Chittagong regional news'
    }
  ]
};

// Helper functions to filter sources
const getSourcesByCredibility = (level) => {
  return NEWS_SOURCES.phase1_auto.filter(source => source.credibility === level);
};

const getSourcesByCategory = (category) => {
  return NEWS_SOURCES.phase1_auto.filter(source => source.category === category);
};

const getActiveSourcesByReadership = (readership) => {
  return NEWS_SOURCES.phase1_auto.filter(source => 
    source.active && source.readership === readership
  );
};

// Get top tier sources (highest credibility and readership)
const getTopTierSources = () => {
  return NEWS_SOURCES.phase1_auto.filter(source => 
    source.credibility === 'high' && 
    ['very-high', 'high'].includes(source.readership) &&
    source.active
  );
};

// Get all active sources sorted by priority
const getActiveSourcesByPriority = () => {
  const priorityMap = {
    'very-high': 4,
    'high': 3,
    'medium-high': 2,
    'medium': 1,
    'low': 0
  };
  
  return NEWS_SOURCES.phase1_auto
    .filter(source => source.active)
    .sort((a, b) => {
      const aPriority = (priorityMap[a.credibility] || 0) + (priorityMap[a.readership] || 0);
      const bPriority = (priorityMap[b.credibility] || 0) + (priorityMap[b.readership] || 0);
      return bPriority - aPriority;
    });
};

module.exports = { 
  NEWS_SOURCES,
  ADDITIONAL_SOURCES,
  getSourcesByCredibility,
  getSourcesByCategory,
  getActiveSourcesByReadership,
  getTopTierSources,
  getActiveSourcesByPriority
};

