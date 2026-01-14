const Cart = require('../models/cartModel');

const cartController = {
  addToCart: async (req, res) => {
    try {
      const { food_id, quantity } = req.body;
      const userId = req.user.id;

      console.log('Add to cart request:', { food_id, quantity, userId });

      if (!food_id || !quantity || quantity <= 0) {
        console.log('Invalid request data:', { food_id, quantity });
        return res.status(400).json({ 
          message: 'Food ID and valid quantity are required' 
        });
      }

      const result = await Cart.addItem(userId, food_id, quantity);
      console.log('Cart add result:', result);
      res.json(result);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Failed to add item to cart' });
    }
  },

  getCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItems = await Cart.getCart(userId);
      const cartTotal = await Cart.getCartTotal(userId);

      res.json({
        items: cartItems,
        total: cartTotal
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({ message: 'Failed to get cart' });
    }
  },

  updateQuantity: async (req, res) => {
    try {
      const { food_id, quantity } = req.body;
      const userId = req.user.id;

      if (!food_id || quantity === undefined) {
        return res.status(400).json({ 
          message: 'Food ID and quantity are required' 
        });
      }

      const result = await Cart.updateQuantity(userId, food_id, quantity);
      res.json(result);
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ message: 'Failed to update cart' });
    }
  },

  removeItem: async (req, res) => {
    try {
      const { food_id } = req.params;
      const userId = req.user.id;

      if (!food_id) {
        return res.status(400).json({ 
          message: 'Food ID is required' 
        });
      }

      const result = await Cart.removeItem(userId, food_id);
      res.json(result);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ message: 'Failed to remove item from cart' });
    }
  },

  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await Cart.clearCart(userId);
      res.json(result);
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ message: 'Failed to clear cart' });
    }
  }
};

module.exports = cartController; 