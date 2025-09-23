import { useState } from "react";
import { Filter } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import Navbar from "../components/Navbar";
import NewsCard from "../components/NewsCard";

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved");
  const [sortBy, setSortBy] = useState("newest");
  const [savedNews, setSavedNews] = useState([
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
  ]);

  const [showFilters, setShowFilters] = useState(false);

  // Handle delete
  const handleDelete = (index) => {
    const updatedNews = savedNews.filter((_, i) => i !== index);
    setSavedNews(updatedNews);
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
            {savedNews.length === 0 ? (
              <p className="text-gray-600 text-center">No saved news yet.</p>
            ) : (
              savedNews.map((news, idx) => (
                <NewsCard
                  key={idx}
                  image={news.image}
                  title={news.title}
                  desc={news.desc}
                  source={news.source}
                  date={news.date}
                  onDelete={() => handleDelete(idx)}
                  isDashboard={true}
                />
              ))
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
