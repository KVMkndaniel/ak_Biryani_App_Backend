const db = require('../config/db');

class Cart {
  static async addItem(userId, foodId, quantity) {
    try {
      // Validate input parameters
      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID provided');
      }
      if (!foodId || isNaN(foodId)) {
        throw new Error('Invalid food ID provided');
      }
      if (!quantity || isNaN(quantity) || quantity <= 0) {
        throw new Error('Invalid quantity provided');
      }

      console.log('Cart.addItem called with:', { userId, foodId, quantity });
      
      // Check if item already exists in cart
      const result = await db.query(
        'SELECT * FROM cart WHERE user_id = $1 AND food_id = $2',
        [parseInt(userId), parseInt(foodId)]
      );

      const existingItem = result.rows;
      console.log('Existing cart items:', existingItem);

      if (existingItem.length > 0) {
        // Update quantity if item exists
        const newQuantity = parseInt(existingItem[0].quantity) + parseInt(quantity);
        console.log('Updating existing item, new quantity:', newQuantity);
        await db.query(
          'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND food_id = $3',
          [newQuantity, parseInt(userId), parseInt(foodId)]
        );
        return { message: 'Cart item updated successfully', quantity: newQuantity };
      } else {
        // Add new item to cart
        console.log('Adding new item to cart');
        await db.query(
          'INSERT INTO cart (user_id, food_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
          [parseInt(userId), parseInt(foodId), parseInt(quantity)]
        );
        return { message: 'Item added to cart successfully', quantity: parseInt(quantity) };
      }
    } catch (error) {
      console.error('❌ Cart.addItem error:', error.message);
      console.error('   Stack:', error.stack);
      throw new Error(`Failed to add item to cart: ${error.message}`);
    }
  }

  static async getCart(userId) {
    try {
      // Validate input parameters
      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID provided');
      }

      const result = await db.query(`
        SELECT 
          c.id,
          c.quantity,
          c.created_at,
          f.id as food_id,
          f.name as food_name,
          (f.amount - COALESCE(f.discount, 0)) as price,
          f.image,
          f.description,
          f.amount,
          f.discount
        FROM cart c
        JOIN foods f ON c.food_id = f.id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
      `, [parseInt(userId)]);

      return result.rows;
    } catch (error) {
      console.error('❌ Cart.getCart error:', error.message);
      throw new Error(`Failed to get cart: ${error.message}`);
    }
  }

  static async updateQuantity(userId, foodId, quantity) {
    try {
      // Validate input parameters
      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID provided');
      }
      if (!foodId || isNaN(foodId)) {
        throw new Error('Invalid food ID provided');
      }
      if (quantity === undefined || isNaN(quantity)) {
        throw new Error('Invalid quantity provided');
      }

      if (parseInt(quantity) <= 0) {
        // Remove item if quantity is 0 or negative
        await db.query(
          'DELETE FROM cart WHERE user_id = $1 AND food_id = $2',
          [parseInt(userId), parseInt(foodId)]
        );
        return { message: 'Item removed from cart' };
      } else {
        // Update quantity
        await db.query(
          'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND food_id = $3',
          [parseInt(quantity), parseInt(userId), parseInt(foodId)]
        );
        return { message: 'Cart updated successfully' };
      }
    } catch (error) {
      console.error('❌ Cart.updateQuantity error:', error.message);
      throw new Error(`Failed to update cart quantity: ${error.message}`);
    }
  }

  static async removeItem(userId, foodId) {
    try {
      // Validate input parameters
      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID provided');
      }
      if (!foodId || isNaN(foodId)) {
        throw new Error('Invalid food ID provided');
      }

      await db.query(
        'DELETE FROM cart WHERE user_id = $1 AND food_id = $2',
        [parseInt(userId), parseInt(foodId)]
      );
      return { message: 'Item removed from cart' };
    } catch (error) {
      console.error('❌ Cart.removeItem error:', error.message);
      throw new Error(`Failed to remove item from cart: ${error.message}`);
    }
  }

  static async clearCart(userId) {
    try {
      // Validate input parameters
      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID provided');
      }

      await db.query(
        'DELETE FROM cart WHERE user_id = $1',
        [parseInt(userId)]
      );
      return { message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('❌ Cart.clearCart error:', error.message);
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  }

  static async getCartTotal(userId) {
    try {
      // Validate input parameters
      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID provided');
      }

      const result = await db.query(`
        SELECT 
          COUNT(*) as item_count,
          SUM(c.quantity * (f.amount - COALESCE(f.discount, 0))) as total_amount
        FROM cart c
        JOIN foods f ON c.food_id = f.id
        WHERE c.user_id = $1
      `, [parseInt(userId)]);

      const row = result.rows[0];
      return {
        itemCount: parseInt(row.item_count) || 0,
        totalAmount: parseFloat(row.total_amount) || 0
      };
    } catch (error) {
      console.error('❌ Cart.getCartTotal error:', error.message);
      throw new Error(`Failed to get cart total: ${error.message}`);
    }
  }
}

module.exports = Cart; 