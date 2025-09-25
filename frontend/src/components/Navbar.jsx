import { User, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { categoryService } from "../services/api"; 

function Navbar({ onCategorySelect, selectedCategory, showCategories = true }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategoriesWithCounts();
        if (response && response.categories) {
          // Add "All" category at the beginning
          const allCategories = [
            { _id: 'all', name: 'All News', summaryCount: 0 },
            ...response.categories
          ];
          setCategories(allCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories if API fails
        setCategories([
          { _id: 'all', name: 'All News', summaryCount: 0 },
          { _id: 'politics', name: 'Politics', summaryCount: 0 },
          { _id: 'sports', name: 'Sports', summaryCount: 0 },
          { _id: 'entertainment', name: 'Entertainment', summaryCount: 0 },
          { _id: 'technology', name: 'Technology', summaryCount: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (showCategories) {
      fetchCategories();
    }
  }, [showCategories]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/home');
  };

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

        {/* Mobile menu button (always visible on mobile) */}
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

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {/* News button - Don't show on Home page */}
          {!currentPath.includes('/home') && !currentPath.match(/^\/$/i) && (
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              News
            </button>
          )}

          {isLoggedIn ? (
            <>
              {/* Profile button - Don't show on Dashboard or Profile page */}
              {!currentPath.includes('/dashboard') && !currentPath.includes('/profile') && (
                <div
                  onClick={() => navigate("/dashboard")}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <User className="w-4 sm:w-5 h-4 sm:h-5 text-gray-700" />
                </div>
              )}
              
              {/* Logout button - Always show when logged in */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 hover:shadow-md transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Login button */
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Category Bar (Desktop) - Only shown when showCategories is true */}
      {showCategories && !loading && (
        <div className="hidden md:block border-t">
          <div className="max-w-7xl mx-auto flex overflow-x-auto justify-start lg:justify-center gap-2 sm:gap-4 lg:gap-7 px-4 sm:px-6 py-3 text-sm font-medium text-gray-700">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onCategorySelect(cat)}
                className={`flex-shrink-0 px-3 py-2 rounded-md transition-all duration-200 ${
                  selectedCategory && selectedCategory._id === cat._id
                    ? "bg-rose-200 text-black font-semibold shadow-sm"
                    : "hover:text-black hover:bg-gray-100"
                }`}
              >
                {cat.name} {cat.summaryCount > 0 && `(${cat.summaryCount})`}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Loading state for categories */}
      {showCategories && loading && (
        <div className="hidden md:block border-t">
          <div className="max-w-7xl mx-auto flex justify-center px-4 sm:px-6 py-3">
            <div className="text-sm text-gray-500">Loading categories...</div>
          </div>
        </div>
      )}

      {/* Mobile menu - Shown on all pages */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="border-t bg-gray-50 max-h-[calc(100vh-80px)] overflow-y-auto">
          {/* Mobile user section */}
          <div className="flex items-center justify-end p-4 border-b bg-white">
            
            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* News button - Don't show on Home page */}
              {!currentPath.includes('/home') && !currentPath.match(/^\/$/i) && (
                <button
                  onClick={() => navigate("/home")}
                  className="px-3 py-1.5 text-base font-medium bg-black text-white rounded-md hover:bg-gray-800 hover:shadow-md transition-all duration-200"
                >
                  News
                </button>
              )}
              
              {isLoggedIn ? (
                <>
                  {/* Profile button - Don't show on Dashboard or Profile page */}
                  {!currentPath.includes('/dashboard') && !currentPath.includes('/profile') && (
                    <div
                      onClick={() => navigate("/dashboard")}
                      className="ml-2 mr-2 w-8 h-8 flex items-center justify-center rounded-full border bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
                    >
                      <User className="w-6 h-6 text-gray-700" />
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-base font-medium bg-red-600 text-white rounded-md hover:bg-red-700 hover:shadow-md transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 text-base font-medium bg-green-600 text-white rounded-md hover:bg-green-700 hover:shadow-md transition-all duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile Dashboard & Profile Navigation (only for logged in users) */}


          {/* Mobile categories */}
          {showCategories && !loading && (
            <div className="p-4 space-y-2 pb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Categories
              </h3>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    onCategorySelect(cat);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                    selectedCategory && selectedCategory._id === cat._id
                      ? "bg-rose-100 text-black font-semibold border-l-4 border-rose-400 shadow-sm"
                      : "text-gray-700 hover:bg-white hover:text-black hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{cat.name}</span>
                    {cat.summaryCount > 0 && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {cat.summaryCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Mobile categories loading */}
          {showCategories && loading && (
            <div className="p-4">
              <div className="text-sm text-gray-500 text-center">Loading categories...</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

