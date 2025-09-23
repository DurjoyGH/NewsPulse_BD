import { useState } from "react";
import Navbar from "../components/Navbar";
import NewsCard from "../components/NewsCard";

function Home() {
  const [searchQuery, setSearchQuery] = useState("All news");

  const newsData = [
    {
      image: "https://via.placeholder.com/150",
      title: "প্রধান উপদেষ্টার সঙ্গে বিএনপি-আওয়ামী লীগের সমাবেশ",
      desc: "প্রধান উপদেষ্টা ও সরকারি কর্মকর্তাদের বক্তব্য আজ বিশেষ...",
      source: "Prothom Alo",
      date: "Sept 23, 2026",
    },
    {
      image: "https://via.placeholder.com/150",
      title: "গাজায় ইসরায়েলি হামলায় আরও ৩৭ ফিলিস্তিনি নিহত",
      desc: "গাজার স্বাস্থ্য মন্ত্রণালয়ের মতে এক বিমান হামলায় বহু হতাহত...",
      source: "NTV",
      date: "Sept 23, 2026",
    },
    {
      image: "https://via.placeholder.com/150",
      title: "অবসর ভেঙে জাতীয় দলে ফিরলেন ডি কক",
      desc: "বিশ্বকাপের পর অবসর নেওয়া সত্ত্বেও আবার ফিরলেন...",
      source: "Jamuna TV",
      date: "Sept 23, 2026",
    },
    {
      image: "https://via.placeholder.com/150",
      title: "পাকিস্তানের সীমান্ত এলাকায় বিমান হামলায় ২৩ জন নিহত",
      desc: "সীমান্তবর্তী অঞ্চলে ভয়াবহ বিমান হামলায় বহু হতাহত...",
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

      <main className="max-w-5xl mx-auto py-8 px-4">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-3/4 border rounded-lg px-4 py-2 text-sm shadow-sm"
          />
        </div>

        {/* Filter Row */}
        <div className="flex justify-between items-center mb-8">
          {/* Left: Sort By Time */}
          <div>
            <select className="border rounded-md px-3 py-2 text-sm shadow-sm">
              <option>Sort By Time</option>
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div>

          {/* Right: Today's Pick & Trending */}
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm">
              Today’s Pick
            </button>
            <button className="px-4 py-2 border rounded-md text-sm bg-white shadow-sm">
              Trending
            </button>
          </div>
        </div>

        {/* News List */}
        {filteredNews.map((news, idx) => (
          <NewsCard key={idx} {...news} />
        ))}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm border-t">
        Copyright 2025 NewsPulse BD
      </footer>
    </div>
    
  );
}

export default Home;
