const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware for single image upload
exports.uploadProfileImage = upload.single('profileImage');

// Update user name
exports.updateUserName = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true, select: '-passwordHash' }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Name updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      },
      success: true
    });

  } catch (error) {
    console.error("Update name error:", error.message);
    res.status(500).json({
      message: "Failed to update name",
      error: "Internal server error"
    });
  }
};

// Upload profile image
exports.uploadImage = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    if (!req.file) {
      return res.status(400).json({
        message: "No image file provided"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      try {
        const oldImagePath = path.join(__dirname, '..', user.profileImage);
        await fs.unlink(oldImagePath);
      } catch (err) {
        console.log("Old image not found or already deleted");
      }
    }

    // Update user with new image path
    const imagePath = `uploads/profiles/${req.file.filename}`;
    user.profileImage = imagePath;
    await user.save();

    res.json({
      message: "Profile image uploaded successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      },
      imageUrl: `${req.protocol}://${req.get('host')}/${imagePath}`,
      success: true
    });

  } catch (error) {
    console.error("Upload image error:", error.message);
    
    // Delete uploaded file if database update fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Failed to delete uploaded file:", unlinkError);
      }
    }

    res.status(500).json({
      message: "Failed to upload image",
      error: "Internal server error"
    });
  }
};

// Delete profile image
exports.deleteImage = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (!user.profileImage) {
      return res.status(400).json({
        message: "No profile image to delete"
      });
    }

    // Delete image file
    try {
      const imagePath = path.join(__dirname, '..', user.profileImage);
      await fs.unlink(imagePath);
    } catch (err) {
      console.log("Image file not found or already deleted");
    }

    // Remove image path from user
    user.profileImage = undefined;
    await user.save();

    res.json({
      message: "Profile image deleted successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: null
      },
      success: true
    });

  } catch (error) {
    console.error("Delete image error:", error.message);
    res.status(500).json({
      message: "Failed to delete image",
      error: "Internal server error"
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      },
      imageUrl: user.profileImage ? `${req.protocol}://${req.get('host')}/${user.profileImage}` : null,
      success: true
    });

  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({
      message: "Failed to get profile",
      error: "Internal server error"
    });
  }
};