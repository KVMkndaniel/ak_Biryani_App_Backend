const express = require('express');
const OrderController = require('../controllers/orderController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders/create:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - totalAmount
 *               - addressId
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               totalAmount:
 *                 type: number
 *               addressId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       500:
 *         description: Server error
 */

// Create a new order
router.post('/create', OrderController.createOrder);

/**
 * @swagger
 * /orders/user:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   totalAmount:
 *                     type: number
 *       500:
 *         description: Server error
 */
router.get('/user', OrderController.getUserOrders);

// Get all orders (admin)
router.get('/all', OrderController.getAllOrders);

// Get order by ID
router.get('/:orderId', OrderController.getOrderById);

// Update order status (admin)
router.put('/:orderId/status', OrderController.updateOrderStatus);

// Get order statistics (admin)
router.get('/stats/overview', OrderController.getOrderStats);

module.exports = router; 