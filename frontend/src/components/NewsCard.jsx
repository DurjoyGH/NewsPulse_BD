import { Bookmark, ExternalLink, Clock, User, Trash2 } from "lucide-react";
import { useState } from "react";
import { userService } from "../services/api";

function NewsCard({ image, title, desc, fullDesc, source, date, url, category, onDelete, isDashboard, id, initialSaved = false, onSaveToggle }) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isSaved) {
        await userService.unsaveArticle(id);
        setIsSaved(false);
        if (onSaveToggle) onSaveToggle(id, false);
      } else {
        await userService.saveArticle(id);
        setIsSaved(true);
        if (onSaveToggle) onSaveToggle(id, true);
      }
    } catch (error) {
      console.error("Error saving/unsaving article:", error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadMore = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleDescription = () => {
    setShowFullDesc(!showFullDesc);
  };

  const hasFullDesc = fullDesc && fullDesc !== desc;

  return (
    <article className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-4 sm:mb-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {/* <div className="relative w-full sm:w-48 lg:w-56 flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-full h-48 sm:h-40 lg:h-44 object-cover"
            loading="lazy"
          />
        </div> */}

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 lg:p-6">
          {/* Header */}
          <div className="space-y-3">
            {/* Category Badge */}
            {category && category.name && (
              <div className="inline-flex items-center">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {category.name}
                </span>
              </div>
            )}
            <h2 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 leading-tight line-clamp-2 hover:text-gray-700 transition-colors cursor-pointer">
              {title}
            </h2>
            <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
              <p className={showFullDesc ? "" : "line-clamp-2 sm:line-clamp-3"}>
                {showFullDesc ? fullDesc : desc}
              </p>
              {hasFullDesc && (
                <button 
                  onClick={toggleDescription}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 transition-colors"
                >
                  {showFullDesc ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 space-y-3">
            {/* Source + Date */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3" />
                <span className="font-medium text-gray-700">{source}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{date}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3">
              {isDashboard ? (
                // Delete button for dashboard
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              ) : (
                // Save button for homepage
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isSaved
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Bookmark
                    className={`w-3 sm:w-4 h-3 sm:h-4 ${
                      isSaved ? "fill-white" : ""
                    }`}
                  />
                  {isLoading ? "..." : (isSaved ? "Saved" : "Save")}
                </button>
              )}

              {/* Read More button */}
              <button 
                onClick={handleReadMore}
                disabled={!url}
                className={`flex items-center gap-2 text-sm sm:text-base font-semibold hover:gap-3 transition-all duration-200 group ${
                  url 
                    ? 'text-black cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>{url ? 'Visit' : 'No Link'}</span>
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default NewsCard;
