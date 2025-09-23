import { Bookmark, ExternalLink, Clock, User } from "lucide-react";
import { useState } from "react";

function NewsCard({ image, title, desc, source, date }) {
  const [isSaved, setIsSaved] = useState(false);
  
  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <article className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden mb-4 sm:mb-6 border border-gray-100">
      {/* Mobile-first layout */}
      <div className="flex flex-col sm:flex-row">
        {/* Image Container */}
        <div className="relative w-full sm:w-48 lg:w-56 flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-full h-48 sm:h-40 lg:h-44 object-cover"
            loading="lazy"
          />
          {/* Mobile save button overlay */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 sm:hidden w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
          >
            <Bookmark 
              className={`w-4 h-4 ${isSaved ? 'fill-black text-black' : 'text-gray-600'}`} 
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 lg:p-6">
          {/* Header */}
          <div className="space-y-3">
            <h2 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 leading-tight line-clamp-2 hover:text-gray-700 transition-colors cursor-pointer">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {desc}
            </p>
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
              {/* Save button (desktop) */}
              <button
                onClick={handleSave}
                className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isSaved 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-3 sm:w-4 h-3 sm:h-4 ${isSaved ? 'fill-white' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>

              {/* Read more button */}
              <button className="flex items-center gap-2 text-black text-sm sm:text-base font-semibold hover:gap-3 transition-all duration-200 group">
                <span>Read More</span>
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
