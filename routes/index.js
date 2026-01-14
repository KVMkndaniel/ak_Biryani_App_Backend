const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes'); // Make sure path is correct
const foodRoutes = require('./foodRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const addressRoutes = require('./addressRoutes');
const notificationRoutes = require('./notificationRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const orderHistoryRoutes = require('./orderHistoryRoutes');

// console.log('🔧 Loading API routes...');

// Health check endpoint
router.get('/', (req, res) => {
// console.log('🏥 Health check endpoint hit');
  res.json({ message: 'Server is running', status: 'ok' });
});

// Debug endpoint to list uploaded files
router.get('/debug/uploads', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        error: 'Uploads directory does not exist',
        uploadsDir: uploadsDir
      });
    }
    
    const files = fs.readdirSync(uploadsDir);
    const fileDetails = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        sizeInKB: Math.round(stats.size / 1024),
        created: stats.birthtime,
        modified: stats.mtime,
        url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
      };
    });
    
    res.json({
      uploadsDir: uploadsDir,
      totalFiles: files.length,
      files: fileDetails
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list uploads',
      message: error.message
    });
  }
});

// Use all routes
router.use(authRoutes);
// console.log('✅ Auth routes loaded');

router.use(userRoutes);
// console.log('✅ User routes loaded');

// ✅ IMPORTANT: Put food routes BEFORE category routes to prevent /:id conflict
router.use('/foods', foodRoutes);
// console.log('✅ Food routes loaded at /foods');

router.use('/categories', categoryRoutes); // Changed from app.use to router.use
// console.log('✅ Category routes loaded at /categories');

router.use('/cart', cartRoutes);
// console.log('✅ Cart routes loaded at /cart');

router.use('/orders', orderRoutes);
// console.log('✅ Order routes loaded at /orders');

router.use('/addresses', addressRoutes);
// console.log('✅ Address routes loaded at /addresses');

router.use('/notifications', notificationRoutes);
// console.log('✅ Notification routes loaded at /notifications');

router.use('/dashboard', dashboardRoutes);
// console.log('✅ Dashboard routes loaded at /dashboard');

router.use('/order-history', orderHistoryRoutes);
// console.log('✅ Order History routes loaded at /order-history');


// Debug endpoint to list all registered routes
router.get('/debug/routes', (req, res) => {
  const routes = [];
  router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

// console.log('🎉 All routes loaded successfully!');

module.exports = router;