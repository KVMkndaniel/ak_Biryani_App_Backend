const express = require('express');
const router = express.Router();
const {
  getUserByMobile,
  updateUser,
  checkUserExistence,
  loginUser,
  getUserProfile,
  updatePassword,
  getAllUsers,
  createUser,
  updateUserById
} = require('../controllers/userController');

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

// Get user profile by JWT token
router.get('/profile', getUserProfile);

// Get user by mobile
router.get('/user', getUserByMobile);

// Update user
router.post('/user/update', updateUser);

// Update password
router.post('/user/update-password', updatePassword);

// Check if user exists
router.get('/check-user', checkUserExistence);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginUser);

// Get all users
router.get('/users', getAllUsers);

// Create user
router.post('/register', createUser);

// Update user by ID
router.put('/user/:id', updateUserById);

module.exports = router;