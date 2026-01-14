const db = require('../config/db');

class Notification {
  // Create a new notification
  static async create({ sender_id, receiver_id, message, food_id = null, order_id = null }) {
    const query = `
      INSERT INTO notifications (sender_id, receiver_id, message, food_id, order_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [sender_id, receiver_id, message, food_id, order_id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get notifications for a specific user
  static async getByReceiverId(receiver_id) {
    const query = `
      SELECT 
        n.*,
        u.name as sender_name,
        u.profile_image as sender_image
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.receiver_id = $1
      ORDER BY n.created_at DESC
    `;
    
    try {
      const result = await db.query(query, [receiver_id]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(id, receiver_id) {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND receiver_id = $2
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, [id, receiver_id]);
      if (result.rows.length === 0) {
        throw new Error('Notification not found or access denied');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get unread count
  static async getUnreadCount(receiver_id) {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE receiver_id = $1 AND is_read = false
    `;
    
    try {
      const result = await db.query(query, [receiver_id]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Delete notification
  static async delete(id, receiver_id) {
    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND receiver_id = $2
      RETURNING *
    `;
    try {
      const result = await db.query(query, [id, receiver_id]);
      return result.rows[0];
    } catch (error) {
      throw error; 
    }
  }
}

module.exports = Notification;
