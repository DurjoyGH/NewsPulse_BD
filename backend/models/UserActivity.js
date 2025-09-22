const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
    actionType: { type: String, enum: ["saved"], required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userActivitySchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model("UserActivity", userActivitySchema);
