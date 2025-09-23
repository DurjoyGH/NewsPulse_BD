import { useState } from "react";
import { Search, Filter, TrendingUp, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import NewsCard from "../components/NewsCard";

function Home() {
  const [searchQuery, setSearchQuery] = useState("All news");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const newsData = [
    {
      image: "https://via.placeholder.com/400x300",
      title: "প্রধান উপদেষ্টার সঙ্গে বিএনপি-আওয়ামী লীগের সমাবেশ",
      desc: "প্রধান উপদেষ্টা ও সরকারি কর্মকর্তাদের বক্তব্য আজ বিশেষ গুরুত্বপূর্ণ একটি বৈঠকে আলোচিত হয়েছে।",
      source: "Prothom Alo",
      date: "Sept 23, 2026",
    },
    {
      image: "https://via.placeholder.com/400x300",
      title: "গাজায় ইসরায়েলি হামলায় আরও ৩৭ ফিলিস্তিনি নিহত",
      desc: "গাজার স্বাস্থ্য মন্ত্রণালয়ের মতে এক বিমান হামলায় বহু হতাহতের ঘটনা ঘটেছে যা আন্তর্জাতিক সম্প্রদায়ের উদ্বেগের কারণ।",
      source: "NTV",
      date: "Sept 23, 2026",
    },
    {
      image: "https://via.placeholder.com/400x300",
      title: "অবসর ভেঙে জাতীয় দলে ফিরলেন ডি কক",
      desc: "বিশ্বকাপের পর অবসর নেওয়া সত্ত্বেও আবার ফিরেছেন দক্ষিণ আফ্রিকার তারকা ব্যাটসম্যান কুইনটন ডি কক।",
      source: "Jamuna TV",
      date: "Sept 23, 2026",
    },
    {
      image: "https://via.placeholder.com/400x300",
      title: "পাকিস্তানের সীমান্ত এলাকায় বিমান হামলায় ২৩ জন নিহত",
      desc: "সীমান্তবর্তী অঞ্চলে ভয়াবহ বিমান হামলায় বহু হতাহতের পাশাপাশি ব্যাপক ক্ষয়ক্ষতি হয়েছে।",
      source: "The Daily Star",
      date: "Sept 23, 2026",
    },
  ];

  const filteredNews =
    searchQuery === "All news"
      ? newsData
      : newsData.filter((n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar onCategorySelect={setSearchQuery} selectedCategory={searchQuery} />

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
              <span>Today's Pick</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base bg-white hover:bg-gray-50 transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
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
          Showing {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''}
          {searchQuery !== "All news" && (
            <span> for "{searchQuery}"</span>
          )}
        </div>

        {/* News Grid */}
        <div className="space-y-4 sm:space-y-6">
          {filteredNews.length > 0 ? (
            filteredNews.map((news, idx) => (
              <NewsCard key={idx} {...news} />
            ))
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search terms or browse all categories.</p>
            </div>
          )}
        </div>
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