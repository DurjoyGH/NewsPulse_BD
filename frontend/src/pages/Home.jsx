import { useState, useEffect } from "react";
import { Search, Filter, TrendingUp, Star, Loader2, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import NewsCard from "../components/NewsCard";
import { summaryService, categoryService } from "../services/api";

function Home() {
  const [selectedCategory, setSelectedCategory] = useState({ _id: 'all', name: 'All News' });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  
  // State for summaries by category
  const [summariesByCategory, setSummariesByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch summaries grouped by categories
  const fetchSummariesByCategory = async () => {
    try {
      const response = await categoryService.getSummariesGroupedByCategory();
      if (response.success) {
        setSummariesByCategory(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching summaries by category:', err);
    }
  };

  // Fetch summaries by specific category
  const fetchSummariesBySpecificCategory = async (categoryId) => {
    try {
      if (categoryId === 'all') {
        // Fetch all summaries with a higher limit
        const response = await summaryService.getSummaries(1, 200);
        if (response.success) {
          return response.summaries || [];
        }
      } else {
        // Fetch summaries for specific category
        const response = await categoryService.getSummariesByCategory(categoryId);
        if (response.summaries) {
          return response.summaries || [];
        }
      }
      return [];
    } catch (err) {
      console.error('Error fetching summaries for category:', err);
      return [];
    }
  };

  // Load data on component mount and when category changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (selectedCategory._id === 'all') {
          // Load all summaries (not grouped by category)
          const allSummaries = await fetchSummariesBySpecificCategory('all');
          setSummariesByCategory([{
            category: { _id: 'all', name: 'All News' },
            summaries: allSummaries,
            summaryCount: allSummaries.length
          }]);
        } else {
          // Load summaries for specific category
          const categoryData = await fetchSummariesBySpecificCategory(selectedCategory._id);
          setSummariesByCategory([{
            category: selectedCategory,
            summaries: categoryData,
            summaryCount: categoryData.length
          }]);
        }
      } catch (err) {
        setError('Failed to load data. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory]);

  // Transform summaries data for display
  const getDisplayData = () => {
    const allSummaries = [];
    
    summariesByCategory.forEach(categoryData => {
      categoryData.summaries.forEach(summary => {
        allSummaries.push({
          id: summary.id || summary._id,
          image: summary.article?.imageUrl || "https://via.placeholder.com/400x300", 
          title: summary.article?.title || 'No title',
          desc: summary.summaryText ? summary.summaryText.substring(0, 200) + '...' : 'No summary available',
          fullDesc: summary.summaryText || 'No summary available',
          source: summary.article?.source?.name || 'Unknown',
          date: new Date(summary.generatedAt || summary.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short', 
            year: 'numeric'
          }),
          url: summary.article?.url,
          type: 'summary',
          category: categoryData.category || summary.category
        });
      });
    });
    
    return allSummaries;
  };

  const displayData = getDisplayData();

  // Filter data based on search query
  const filteredNews = !searchQuery 
    ? displayData
    : displayData.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Sort filtered data
  const sortedNews = [...filteredNews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'popular':
        return b.title.length - a.title.length; // Simple popularity metric
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar onCategorySelect={setSelectedCategory} selectedCategory={selectedCategory} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
        {/* Search Section */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Display Mode Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-blue-800 font-medium">
              {selectedCategory.name} ({displayData.length} summaries)
            </span>
          </div>
          <div className="flex items-center gap-3">
            {selectedCategory._id !== 'all' && (
              <button
                onClick={() => setSelectedCategory({ _id: 'all', name: 'All News' })}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All Summaries
              </button>
            )}
            {/* {selectedCategory._id === 'all' && (
              <div className="text-sm text-gray-600">
                Use categories above to filter by topic
              </div>
            )} */}
          </div>
        </div>

        {/* Filter & Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 sm:mb-8">
          {/* Left: Filter controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Sort By</span>
            </button>
            
            {/* Desktop sort dropdown */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden sm:block border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Right: Quick action buttons */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors">
              <Star className="w-4 h-4" />
              <span>Latest</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base bg-white hover:bg-gray-50 transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span>Popular</span>
            </button>
          </div>
        </div>

        {/* Mobile sort dropdown */}
        {showFilters && (
          <div className="sm:hidden mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sort Options</h3>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {sortedNews.length} item{sortedNews.length !== 1 ? 's' : ''}
          {searchQuery && (
            <span> for "{searchQuery}"</span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading content...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <div className="space-y-4 sm:space-y-6">
            {sortedNews.length > 0 ? (
              sortedNews.map((news) => (
                <div key={`${news.type}-${news.id}`}>
                  <NewsCard {...news} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? "Try adjusting your search terms or browse all categories."
                    : selectedCategory._id === 'all'
                    ? "No summaries available yet. Please check back later."
                    : `No summaries found in ${selectedCategory.name} category.`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
          <div className="text-center space-y-4">
            {/* <h3 className="text-lg sm:text-xl font-bold text-gray-900">NewsPulse BD</h3>
            <p className="text-sm sm:text-base text-gray-600">Your trusted source for news in Bangladesh</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700 transition-colors">About</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
            </div> */}
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 NewsPulse BD. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;