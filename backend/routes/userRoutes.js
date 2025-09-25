const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/auth');

// Get user profile
router.get('/profile', authMiddleware, userController.getUserProfile);

// Update user name
router.put('/name', authMiddleware, userController.updateUserName);

// Upload profile image
router.post('/upload-image', authMiddleware, userController.uploadProfileImage, userController.uploadImage);

// Delete profile image
router.post('/delete-image', authMiddleware, userController.deleteImage);

module.exports = router;