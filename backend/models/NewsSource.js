const mongoose = require("mongoose");

const newsSourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    rssFeedUrl: { type: String },
    logo: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NewsSource", newsSourceSchema);
