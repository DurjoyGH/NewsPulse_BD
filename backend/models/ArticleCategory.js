const mongoose = require("mongoose");

const articleCategorySchema = new mongoose.Schema(
  {
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

articleCategorySchema.index({ article: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("ArticleCategory", articleCategorySchema);
