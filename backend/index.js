require('dotenv').config()
const express = require('express')
const path = require('path')
const connectDB = require('./configs/db')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const summaryRoutes = require('./routes/summaryRoutes')

const app = express()

// Middleware
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
connectDB()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/summary", summaryRoutes)

app.get("/", (req, res) => {
    res.send("API is Running!")
})

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})