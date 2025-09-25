import { useState, useEffect } from "react";
import { Filter, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import Navbar from "../components/Navbar";
import NewsCard from "../components/NewsCard";
import { userService } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved");
  const [sortBy, setSortBy] = useState("newest");
  const [savedNews, setSavedNews] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch saved articles
  const fetchSavedArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getSavedArticles();
      if (response.success) {
        setSavedNews(response.articles || []);
      }
    } catch (err) {
      console.error('Error fetching saved articles:', err);
      setError('Failed to load saved articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load saved articles on component mount
  useEffect(() => {
    fetchSavedArticles();
  }, []);

  // Handle delete (unsave)
  const handleDelete = async (articleId) => {
    try {
      await userService.unsaveArticle(articleId);
      setSavedNews(prev => prev.filter(article => article.id !== articleId));
    } catch (error) {
      console.error('Error unsaving article:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <Navbar showCategories={false} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-4 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-5 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "saved"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Saved News
            </button>
            <button
              onClick={() => navigate("/profile")} 
              className="px-5 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
            >
              View Profile
            </button>
          </div>
        </div>

        {/* Total news bar */}
        {activeTab === "saved" && (
          <div className="bg-white border rounded-lg px-4 py-3 mb-6 text-sm font-medium text-gray-700 shadow">
            Total {savedNews.length} news{" "}
            {savedNews.length === 1 ? "is" : "are"} saved!
          </div>
        )}

        {/* Filter & Sort */}
        {activeTab === "saved" && (
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

            {/* Right: Today's Pick */}
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800 transition">
              Today&apos;s Pick
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === "saved" && (
          <div>
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading saved articles...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-red-800">Error Loading Saved Articles</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                    <button 
                      onClick={fetchSavedArticles} 
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                {savedNews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Loader2 className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved articles yet</h3>
                    <p className="text-gray-600">
                      Start saving articles from the home page to see them here.
                    </p>
                  </div>
                ) : (
                  savedNews.map((news) => (
                    <NewsCard
                      key={news.id}
                      id={news.id}
                      image={news.imageUrl}
                      title={news.title}
                      desc={news.description?.substring(0, 200) + '...' || 'No description available'}
                      fullDesc={news.description}
                      source={news.source?.name || 'Unknown'}
                      date={new Date(news.savedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short', 
                        year: 'numeric'
                      })}
                      url={news.url}
                      category={news.category}
                      onDelete={() => handleDelete(news.id)}
                      isDashboard={true}
                      initialSaved={true}
                    />
                  ))
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer*/}
      <footer className="bg-white border-t mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
          <div className="text-center space-y-4">
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 NewsPulse BD. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
