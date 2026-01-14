const db = require('../config/db');

// 📊 Get Dashboard Analytics
const getDashboardStats = async (req, res) => {
  try {
    // 1. User Growth (Monthly)
    const userGrowthQuery = `
      SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count 
      FROM users 
      WHERE created_at IS NOT NULL
      GROUP BY TO_CHAR(created_at, 'YYYY-MM'), TO_CHAR(created_at, 'Mon')
      ORDER BY TO_CHAR(created_at, 'YYYY-MM') DESC
      LIMIT 6
    `;
    const userGrowthResult = await db.query(userGrowthQuery);
    
    // 2. Order Trends (Monthly)
    const orderTrendsQuery = `
      SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count 
      FROM orders 
      WHERE created_at IS NOT NULL
      GROUP BY TO_CHAR(created_at, 'YYYY-MM'), TO_CHAR(created_at, 'Mon')
      ORDER BY TO_CHAR(created_at, 'YYYY-MM') DESC
      LIMIT 6
    `;
    const orderTrendsResult = await db.query(orderTrendsQuery);

    // 3. Overall Stats
    const totalUsersResult = await db.query('SELECT COUNT(*) FROM users');
    const totalOrdersResult = await db.query('SELECT COUNT(*) FROM orders');
    const totalSalesResult = await db.query('SELECT SUM(total_amount) FROM orders WHERE order_status = \'delivered\'');

    res.json({
      userGrowth: userGrowthResult.rows.reverse(), // Show oldest to newest
      orderTrends: orderTrendsResult.rows.reverse(),
      stats: {
        totalUsers: parseInt(totalUsersResult.rows[0].count),
        totalOrders: parseInt(totalOrdersResult.rows[0].count),
        totalSales: parseFloat(totalSalesResult.rows[0].sum || 0)
      }
    });

  } catch (err) {
    console.error('❌ Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

module.exports = {
  getDashboardStats
};
