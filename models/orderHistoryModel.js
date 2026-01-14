const db = require('../config/db');

class OrderHistory {
  // Create a new order history entry
  static async createOrderHistory(data) {
    try {
      const { user_id, order_id, food_id, order_details } = data;
      const result = await db.query(
        `INSERT INTO order_history (user_id, order_id, food_id, order_details, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [user_id, order_id, food_id, order_details]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all order history
  static async getAllOrderHistory() {
    try {
      const result = await db.query('SELECT * FROM order_history ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get order history by ID
  static async getOrderHistoryById(id) {
    try {
      const result = await db.query('SELECT * FROM order_history WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        throw new Error('Order History entry not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get order history by User ID
  static async getOrderHistoryByUserId(userId) {
    try {
      const result = await db.query('SELECT * FROM order_history WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Delete order history entry
  static async deleteOrderHistory(id) {
    try {
      const result = await db.query('DELETE FROM order_history WHERE id = $1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        throw new Error('Order History entry not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderHistory;
