const mongoose = require("mongoose");

const summaryCategorySchema = new mongoose.Schema(
  {
    summary: { type: mongoose.Schema.Types.ObjectId, ref: "Summary", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

summaryCategorySchema.index({ summary: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("SummaryCategory", summaryCategorySchema);
