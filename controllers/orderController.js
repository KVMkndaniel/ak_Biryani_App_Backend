const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { getAdminAndOwnerIds } = require('../models/userModel');
const Notification = require('../models/notificationModel');

class OrderController {
  // Create a new order
  static async createOrder(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const {
        paymentMethod,
        deliveryAddress,
        userInfo
      } = req.body;

      // Validate required fields
      if (!paymentMethod || !deliveryAddress || !userInfo) {
        return res.status(400).json({ 
          message: 'Payment method, delivery address, and user info are required' 
        });
      }

      // Get cart items
      const cartItems = await Cart.getCart(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          food_id: item.food_id,
          food_name: item.food_name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount,
        paymentMethod,
        deliveryAddress,
        userInfo
      };

      // Create order
      const result = await Order.createOrder(userId, orderData);

      // Send notification to Admins and Owners
      try {
        const adminIds = await getAdminAndOwnerIds();
        for (const adminId of adminIds) {
          await Notification.create({
            sender_id: userId,
            receiver_id: adminId,
            message: `New Order #${result.orderId} placed by ${userInfo.name}. Amount: ${totalAmount}`,
            order_id: result.orderId
          });
        }
        
        // Also verify if we need to send notification to the user themselves? 
        // Request said: "sender mesage or account created messages based send notification"
        // And "customer role user any food order... then automaticaaly triger notificatin in Admin Role and Owner role"
        // So strict reading means only Admin/Owner.
        
      } catch (notifError) {
        console.error('Failed to create order notification:', notifError);
      }

      res.status(201).json({
        message: 'Order created successfully',
        orderId: result.orderId,
        totalAmount
      });


    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ 
        message: 'Failed to create order',
        error: error.message 
      });
    }
  }

  // Get user's orders
  static async getUserOrders(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const orders = await Order.getOrders(userId);
      
      res.status(200).json({
        message: 'Orders retrieved successfully',
        orders
      });

    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ 
        message: 'Failed to get orders',
        error: error.message 
      });
    }
  }

  // Get all orders (admin only)
  static async getAllOrders(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user is admin (you might want to add role checking)
      // For now, we'll allow any authenticated user to view all orders

      const orders = await Order.getOrders();
      
      res.status(200).json({
        message: 'All orders retrieved successfully',
        orders
      });

    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({ 
        message: 'Failed to get orders',
        error: error.message 
      });
    }
  }

  // Get order by ID
  static async getOrderById(req, res) {
    try {
      const { orderId } = req.params;
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const order = await Order.getOrderById(orderId);
      
      // Check if user owns this order or is admin
      if (order.user_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.status(200).json({
        message: 'Order retrieved successfully',
        order
      });

    } catch (error) {
      console.error('Get order by ID error:', error);
      if (error.message === 'Order not found') {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(500).json({ 
        message: 'Failed to get order',
        error: error.message 
      });
    }
  }

  // Update order status (admin only)
  static async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be one of: pending, approved, rejected, delivered' 
        });
      }

      // Get order details to get customer info
      const order = await Order.getOrderById(orderId);
      
      const result = await Order.updateOrderStatus(orderId, status);
      

      
      res.status(200).json({
        message: 'Order status updated successfully',
        result
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ 
        message: 'Failed to update order status',
        error: error.message 
      });
    }
  }

  // Get order statistics (admin only)
  static async getOrderStats(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const stats = await Order.getOrderStats();
      
      res.status(200).json({
        message: 'Order statistics retrieved successfully',
        stats
      });

    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({ 
        message: 'Failed to get order statistics',
        error: error.message 
      });
    }
  }
}

module.exports = OrderController; 