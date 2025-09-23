import { Link } from "react-router-dom";
import { User } from "lucide-react";

function Navbar({ onCategorySelect, selectedCategory }) {
  const categories = [
    "National",
    "Breaking news",
    "Political news",
    "International news",
    "Sports",
    "Entertainment",
    "Culture",
    "Arts",
    "All news",
  ];

  return (
    <header className="bg-white font-sans border-b">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto flex justify-between items-center py-5 px-6">
        {/* Logo */}
        <h1 className="text-xl font-bold bg-black text-white px-3 py-1 rounded">
          NewsPulse BD
        </h1>

        {/* Right side */}

        <div className="flex items-center gap-3">
            <span className="text-sm font-medium border-b-2 border-black">
                News
            </span>
            <div className="w-9 h-9 flex items-center justify-center rounded-full border bg-gray-100">
                <User className="w-5 h-5 text-gray-700" />
            </div>
        </div>

      </div>

      {/* Second bar (categories) */}
        <div className="border-t">
            <div className="max-w-7xl mx-auto flex justify-center gap-7 px-6 py-3 text-sm font-medium text-gray-700">
                {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onCategorySelect(cat)}
                    className={`px-3 py-1 rounded-md ${
                    selectedCategory === cat
                        ? "bg-rose-200 text-black font-semibold"
                        : "hover:text-black"
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>
        </div>

    </header>
  );
}

export default Navbar;
