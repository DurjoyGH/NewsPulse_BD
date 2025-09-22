const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    source: { type: mongoose.Schema.Types.ObjectId, ref: "NewsSource", required: true },
    title: { type: String, required: true },
    content: { type: String },
    url: { type: String, required: true },
    publishedAt: { type: Date },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
