const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(authMiddleware);

// Add item to cart
router.post('/add', cartController.addToCart);

// Get user's cart
router.get('/', cartController.getCart);

// Update item quantity in cart
router.put('/update', cartController.updateQuantity);

// Remove item from cart
router.delete('/remove/:food_id', cartController.removeItem);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

module.exports = router; 