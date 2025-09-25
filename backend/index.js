require('dotenv').config()
const express = require('express')
const cron = require('node-cron');
const cors = require('cors')
const path = require('path')
const connectDB = require('./configs/db')
const NewsExtractorService = require('./services/NewsExtractorService');
const NewsStorageService = require('./services/NewsStorageService');
const authRoutes = require('./routes/authRoutes')
const newsRoutes = require('./routes/newsRoutes');
const userRoutes = require('./routes/userRoutes')
const summaryRoutes = require('./routes/summaryRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const articleRoutes = require('./routes/articleRoutes')


const app = express()

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
connectDB()

// Services
const newsExtractor = new NewsExtractorService();
const newsStorage = new NewsStorageService();

// Routes
app.use("/api/auth", authRoutes)
app.use('/api/news', newsRoutes);
app.use("/api/user", userRoutes)
app.use("/api/summary", summaryRoutes)
app.use("/api/category", categoryRoutes)
app.use("/api/articles", articleRoutes)

app.get("/", (req, res) => {
    res.send("API is Running!")
})


// Scheduled news extraction every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Starting scheduled news extraction...');
  try {
    const newsItems = await newsExtractor.extractAllSources();
    await newsStorage.saveNewsItems(newsItems);
    console.log(`Extracted and saved ${newsItems.length} news items`);
  } catch (error) {
    console.error('Scheduled extraction error:', error);
  }
});

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})