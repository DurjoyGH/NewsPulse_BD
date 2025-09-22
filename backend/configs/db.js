const mongoose = require("mongoose");

const dbUrl = process.env.DB_URL;

const connectDB = async () => {
  try {
    const connected = await mongoose.connect(dbUrl, {});

    console.log(`MongoDB Connected: ${connected.connection.host}`);
  } catch (err) {
    console.error("MongoDB Connection Failed!", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
