require('dotenv').config()
const express = require('express')
const connectDB = require('./configs/db')
const authRoutes = require('./routes/authRoutes')
const summaryRoutes = require('./routes/summaryRoutes')

const app = express()

// Middleware
app.use(express.json());

// Database connection
connectDB()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/summarize", summaryRoutes)

app.get("/", (req, res) => {
    res.send("API is Running!")
})

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})