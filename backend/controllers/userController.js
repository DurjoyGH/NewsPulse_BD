const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const multer = require('multer');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '..', 'uploads');
const profilesDir = path.join(uploadDir, 'profiles');

// Create directories if they don't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use absolute path to ensure correct directory
    const uploadPath = path.join(__dirname, '..', 'uploads/profiles');
    cb(null, uploadPath);
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
    
    // Verify file was saved correctly
    try {
      const filePath = path.join(__dirname, '..', 'uploads/profiles', req.file.filename);
      await fsPromises.access(filePath);
    } catch (fileErr) {
      console.error("File access error:", fileErr);
      return res.status(500).json({
        message: "Failed to save uploaded file",
        error: "File system error"
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
        await fsPromises.unlink(oldImagePath);
      } catch (err) {
        console.log("Old image not found or already deleted");
      }
    }

    // Update user with new image path - store path relative to server root
    // Even though the file is saved with an absolute path, we store a relative path in the database
    const imagePath = `uploads/profiles/${req.file.filename}`;
    user.profileImage = imagePath;
    
    try {
      await user.save();
    } catch (saveErr) {
      console.error("Database save error:", saveErr);
      // Try to delete the uploaded file if database update fails
      try {
        const filePath = req.file.path; // Multer already provides the full path
        await fsPromises.unlink(filePath);
      } catch (unlinkErr) {
        console.error("Failed to delete file after save error:", unlinkErr);
      }
      
      return res.status(500).json({
        message: "Failed to update user profile with new image",
        error: "Database error"
      });
    }

    // Construct full URL for the image
    const imageUrl = `${req.protocol}://${req.get('host')}/${imagePath.replace(/\\/g, '/')}`;
    
    res.json({
      message: "Profile image uploaded successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      },
      imageUrl: imageUrl,
      success: true
    });

  } catch (error) {
    console.error("Upload image error:", error.message);
    
    // Delete uploaded file if any error occurs
    if (req.file) {
      try {
        const filePath = path.join(__dirname, '..', 'uploads/profiles', req.file.filename);
        await fsPromises.unlink(filePath);
      } catch (unlinkError) {
        console.error("Failed to delete uploaded file:", unlinkError);
      }
    }

    res.status(500).json({
      message: "Failed to upload image",
      error: error.message || "Internal server error"
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
      
      // Check if file exists before attempting to delete
      try {
        await fsPromises.access(imagePath);
      } catch (accessErr) {
        console.log("Image file not found:", accessErr.message);
        // Continue with user update even if file is not found
      }
      
      // Attempt to delete the file
      try {
        await fsPromises.unlink(imagePath);
      } catch (unlinkErr) {
        console.log("Failed to delete image file:", unlinkErr.message);
        // Continue with user update even if deletion fails
      }
    } catch (err) {
      console.log("Image file operation error:", err.message);
    }

    // Remove image path from user - do this even if file deletion failed
    user.profileImage = undefined;
    
    try {
      await user.save();
    } catch (saveErr) {
      console.error("Error saving user after image deletion:", saveErr);
      return res.status(500).json({
        message: "Failed to update user after image deletion",
        error: "Database error"
      });
    }

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