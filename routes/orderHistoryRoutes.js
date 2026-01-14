const express = require('express');
const router = express.Router();
const orderHistoryController = require('../controllers/orderHistoryController');

// Create new order history
router.post('/', orderHistoryController.createOrderHistory);

// Get all order history
router.get('/', orderHistoryController.getAllOrderHistory);

// Get order history by ID
router.get('/:id', orderHistoryController.getOrderHistoryById);

// Get order history by User ID
router.get('/user/:userId', orderHistoryController.getOrderHistoryByUserId);

// Delete order history
router.delete('/:id', orderHistoryController.deleteOrderHistory);

module.exports = router;
