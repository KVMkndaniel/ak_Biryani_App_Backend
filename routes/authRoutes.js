const express = require('express');
const router = express.Router();
const { upload, registerUser } = require('../controllers/authController');
const performanceMonitor = require('../utils/performanceMonitor');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - mobile
 *               - password
 *               - role
 *               - profile_image
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already registered
 *       500:
 *         description: Server error
 */
router.post('/register', upload.single('profile_image'), registerUser);

// Performance monitoring endpoint (for development/debugging)
router.get('/performance', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Performance metrics not available in production' });
  }
  
  const metrics = performanceMonitor.getMetrics();
  res.json({
    message: 'Performance metrics',
    data: metrics,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
