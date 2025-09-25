const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Classify single news article
router.post("/classify", categoryController.classifyNews);

module.exports = router;