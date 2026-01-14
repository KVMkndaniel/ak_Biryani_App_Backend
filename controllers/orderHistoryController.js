const OrderHistory = require('../models/orderHistoryModel');

// Create a new order history entry
exports.createOrderHistory = async (req, res) => {
  try {
    const { user_id, order_id, food_id, order_details } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const newHistory = await OrderHistory.createOrderHistory({
      user_id,
      order_id,
      food_id,
      order_details
    });

    res.status(201).json({
      message: 'Order history created successfully',
      data: newHistory
    });
  } catch (error) {
    console.error('Error creating order history:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all order history
exports.getAllOrderHistory = async (req, res) => {
  try {
    const history = await OrderHistory.getAllOrderHistory();
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching all order history:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get order history by ID
exports.getOrderHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await OrderHistory.getOrderHistoryById(id);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching order history by ID:', error);
    if (error.message === 'Order History entry not found') {
      return res.status(404).json({ message: 'Order History entry not found' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get order history by User ID
exports.getOrderHistoryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await OrderHistory.getOrderHistoryByUserId(userId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching order history by User ID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete order history
exports.deleteOrderHistory = async (req, res) => {
  try {
    const { id } = req.params;
    await OrderHistory.deleteOrderHistory(id);
    res.status(200).json({ message: 'Order history entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting order history:', error);
    if (error.message === 'Order History entry not found') {
      return res.status(404).json({ message: 'Order History entry not found' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
