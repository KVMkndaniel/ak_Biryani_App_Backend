// controllers/authController.js
const path = require('path');
const multer = require('multer');
const { createUser, getAdminAndOwnerIds } = require('../models/userModel');
const Notification = require('../models/notificationModel');
const performanceMonitor = require('../utils/performanceMonitor');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

const registerUser = async (req, res) => {
  const startTime = performanceMonitor.startTimer();
  
  try {
    const { name, email, mobile, password, role } = req.body;
    const file = req.file;

    // Validate required fields
    if (!name || !email || !mobile || !password || !role || !file) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          name: !name,
          email: !email,
          mobile: !mobile,
          password: !password,
          role: !role,
          image: !file
        }
      });
    }

    // Basic validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be 10 digits' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Store the filename in DB
    const imageFilename = file.filename;

    console.log(`🚀 Creating user: ${email}`);
    
    const result = await createUser({ name, email, mobile, password, role, profile_image: imageFilename });
    
    // Trigger notification for admins/owners
    try {
      const adminIds = await getAdminAndOwnerIds();
      const newUserId = result.rows[0].id; // createUser returns the insert result with RETURNING id

      for (const adminId of adminIds) {
        // Don't notify self if admin creates admin
        if (adminId !== newUserId) {
          await Notification.create({
            sender_id: newUserId,
            receiver_id: adminId,
            message: `New ${role} account created: ${name}`,
          });
        }
      }
    } catch (notifError) {
      console.error('Failed to create registration notification:', notifError);
    }
    
    const totalTime = performanceMonitor.endTimer(startTime, 'registration');
    performanceMonitor.logPerformance('User Registration', totalTime, { email });
    
    res.status(201).json({ 
      message: 'User registered successfully',
      processingTime: `${totalTime}ms`
    });
  } catch (error) {
    const totalTime = performanceMonitor.endTimer(startTime, 'registration');
    performanceMonitor.logPerformance('Registration Error', totalTime, { error: error.message });
    
    if (error.message.includes('already registered')) {
      return res.status(409).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { upload, registerUser };
