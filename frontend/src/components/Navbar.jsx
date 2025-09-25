import { User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 

function Navbar({ onCategorySelect, selectedCategory, showCategories = true }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate(); 

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white font-sans border-b sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3 sm:py-5 px-4 sm:px-6">
        {/* Logo */}
        <h1 className="text-base sm:text-xl lg:text-2xl font-bold bg-black text-white px-2 sm:px-3 py-1 rounded">
          NewsPulse BD
        </h1>

        {/* Mobile menu button (only if categories are visible) */}
        {showCategories && (
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        )}

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {/* News button */}
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            News
          </button>

          {/* Profile button */}
          <div
            onClick={() => navigate("/dashboard")}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <User className="w-4 sm:w-5 h-4 sm:h-5 text-gray-700" />
          </div>
        </div>
      </div>

      {/* Category Bar (Desktop + Mobile) */}
      {showCategories && (
        <>
          {/* Desktop categories */}
          <div className="hidden md:block border-t">
            <div className="max-w-7xl mx-auto flex overflow-x-auto justify-start lg:justify-center gap-2 sm:gap-4 lg:gap-7 px-4 sm:px-6 py-3 text-sm font-medium text-gray-700">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategorySelect(cat)}
                  className={`flex-shrink-0 px-3 py-2 rounded-md transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-rose-200 text-black font-semibold shadow-sm"
                      : "hover:text-black hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="border-t bg-gray-50 max-h-[calc(100vh-80px)] overflow-y-auto">
              {/* Mobile user section */}
              <div className="flex items-center gap-3 p-4 border-b bg-white">
                <div
                  onClick={() => navigate("/dashboard")}
                  className="w-10 h-10 flex items-center justify-center rounded-full border bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
                >
                  <User className="w-5 h-5 text-gray-700" />
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 hover:shadow-md transition-all duration-200"
                >
                  News
                </button>
              </div>

              {/* Mobile categories */}
              <div className="p-4 space-y-2 pb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Categories
                </h3>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      onCategorySelect(cat);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                      selectedCategory === cat
                        ? "bg-rose-100 text-black font-semibold border-l-4 border-rose-400 shadow-sm"
                        : "text-gray-700 hover:bg-white hover:text-black hover:shadow-sm"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Navbar;
