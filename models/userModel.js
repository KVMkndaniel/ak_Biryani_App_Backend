// models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (user) => {
  const { name, email, mobile, password, role, profile_image } = user;

  try {
    // Start transaction for better performance and data consistency
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Check if email or mobile already exists
      const checkRes = await client.query(
        'SELECT id FROM users WHERE email = $1 OR mobile = $2 LIMIT 1',
        [email, mobile]
      );

      if (checkRes.rows.length > 0) {
        throw new Error('This email or mobile number is already registered');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Get role ID and insert user in one optimized query
      const insertRes = await client.query(
        `INSERT INTO users (name, email, mobile, password, role_id, profile_image) 
         SELECT $1, $2, $3, $4, r.id, $5 
         FROM roles r 
         WHERE r.name = $6
         RETURNING id`,
        [name, email, mobile, hashedPassword, profile_image, role]
      );

      if (insertRes.rowCount === 0) {
        throw new Error('Invalid role');
      }

      await client.query('COMMIT');
      return insertRes;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    throw err;
  }
};

const getAdminAndOwnerIds = async () => {
  try {
    const result = await db.query(`
      SELECT u.id 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('admin', 'owner')
    `);
    return result.rows.map(row => row.id);
  } catch (error) {
    throw error;
  }
};

module.exports = { createUser, getAdminAndOwnerIds };
