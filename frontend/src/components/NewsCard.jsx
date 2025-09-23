function NewsCard({ image, title, desc, source, date }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm flex p-5 mb-6 hover:shadow-md transition">
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-40 h-32 rounded-md object-cover mr-5"
      />

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="font-bold text-lg text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-2 leading-snug">{desc}</p>
        </div>

        {/* Footer */}
        <div className="mt-4">
          {/* Source + Date (stacked) */}
          <div className="flex flex-col text-sm text-gray-600 pb-2">
            <span className="font-medium">{source}</span>
            <span>{date}</span>
          </div>

          {/* Save + Visit */}
          <div className="flex justify-between items-center mt-3">
            <button className="px-4 py-1 rounded-full text-sm bg-black text-white hover:bg-gray-800">
              Save it
            </button>
            <a
              href="#"
              className="text-black text-sm font-semibold hover:underline"
            >
              Visit_Here →
            </a>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
