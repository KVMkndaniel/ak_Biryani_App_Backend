const db = require('../config/db');

class Order {
  static async createOrder(userId, orderData) {
    const connection = await db.getConnection();
    try {
      const {
        items,
        totalAmount,
        paymentMethod,
        deliveryAddress,
        userInfo
      } = orderData;

      // Start transaction
      await connection.beginTransaction();

      // Create order
      const orderResult = await connection.query(`
        INSERT INTO orders (
          user_id, 
          total_amount, 
          payment_method, 
          delivery_address,
          user_name,
          user_email,
          user_mobile,
          order_status,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
        RETURNING id
      `, [
        userId,
        totalAmount,
        paymentMethod,
        deliveryAddress,
        userInfo.name,
        userInfo.email,
        userInfo.mobile
      ]);

      const orderId = orderResult.rows[0].id;

      // Create order items
      for (const item of items) {
        // Insert into order_items
        await connection.query(`
          INSERT INTO order_items (
            order_id,
            food_id,
            food_name,
            food_image,
            price,
            quantity,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [
          orderId,
          item.food_id,
          item.food_name,
          item.image,
          item.price,
          item.quantity
        ]);

        // Insert into order_history
        const historyDetails = JSON.stringify({
          food_name: item.food_name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          total_item_price: item.price * item.quantity
        });

        await connection.query(`
          INSERT INTO order_history (
            user_id,
            order_id,
            food_id,
            order_details,
            created_at
          ) VALUES ($1, $2, $3, $4, NOW())
        `, [
          userId,
          orderId,
          item.food_id,
          historyDetails
        ]);
      }

      // Clear user's cart after successful order
      await connection.query('DELETE FROM cart WHERE user_id = $1', [userId]);

      await connection.commit();
      return { orderId, message: 'Order created successfully' };
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async getOrders(userId = null) {
    try {
      let queryText = `
        SELECT 
          o.id,
          o.total_amount,
          o.payment_method,
          o.delivery_address,
          o.user_name,
          o.user_email,
          o.user_mobile,
          o.order_status,
          o.created_at,
          u.name as user_name_from_users,
          u.email as user_email_from_users
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
      `;

      const params = [];
      if (userId) {
        queryText += ' WHERE o.user_id = $1';
        params.push(userId);
      }

      queryText += ' ORDER BY o.created_at DESC';

      const result = await db.query(queryText, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getOrderById(orderId) {
    try {
      // Get order details
      const orderResult = await db.query(`
        SELECT 
          o.*,
          u.name as user_name_from_users,
          u.email as user_email_from_users
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = $1
      `, [orderId]);

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      // Get order items
      const itemsResult = await db.query(`
        SELECT * FROM order_items WHERE order_id = $1
      `, [orderId]);

      return {
        ...order,
        items: itemsResult.rows
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateOrderStatus(orderId, status) {
    try {
      await db.query(`
        UPDATE orders 
        SET order_status = $1, updated_at = NOW()
        WHERE id = $2
      `, [status, orderId]);

      return { message: 'Order status updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getOrderStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN order_status = 'approved' THEN 1 END) as approved_orders,
          COUNT(CASE WHEN order_status = 'rejected' THEN 1 END) as rejected_orders,
          SUM(total_amount) as total_revenue
        FROM orders
      `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order;