const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ Get user profile by JWT token
const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const result = await db.query(`
      SELECT u.id, u.name, u.email, u.mobile, u.profile_image, u.address, u.bio, u.role_id, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role_id: user.role_id,
      role_name: user.role_name,
      profile_image: user.profile_image,
      address: user.address || '',
      bio: user.bio || ''
    });
  } catch (err) {
    console.error('❌ Error getting user profile:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Database error' });
  }
};

// ✅ Check if user exists by mobile
const checkUserExistence = async (req, res) => {
  try {
    const mobile = req.query.mobile;
    if (!mobile) return res.status(400).json({ exists: false, message: 'Mobile number is required' });

    const result = await db.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    return res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error('❌ Error checking user existence:', err);
    return res.status(500).json({ exists: false, message: 'Database error' });
  }
};

// 🔍 Get full user details by mobile
const getUserByMobile = async (req, res) => {
  try {
    const mobile = req.query.mobile;
    if (!mobile) return res.status(400).json({ message: 'Mobile required' });

    const result = await db.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error getting user by mobile:', err);
    res.status(500).json({ message: 'DB error' });
  }
};

// ✏️ Update user details by mobile
const updateUser = async (req, res) => {
  try {
    const { name, email, role, bio, mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: 'Mobile required' });

    await db.query(
      'UPDATE users SET name=$1, email=$2, role_id=(SELECT id FROM roles WHERE name=$3), bio=$4 WHERE mobile=$5',
      [name, email, role, bio, mobile]
    );
    // Note: role is usually name in frontend but role_id in users. Original query updated role=?, 
    // but users table only has role_id. I suspect original code was buggy or roles table usage was different.
    // Assuming role matches name in roles table.

    const result = await db.query('SELECT * FROM users WHERE mobile=$1', [mobile]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ message: 'DB error' });
  }
};

// 🔐 JWT login
const loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: 'Mobile and password are required' });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not configured!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const result = await db.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, mobile: user.mobile, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('✅ JWT Token generated successfully');
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    console.log('👤 User ID:', user.id);
    console.log('📱 Mobile:', user.mobile);

    // Fetch role name
    const roleResult = await db.query('SELECT name FROM roles WHERE id = $1', [user.role_id]);
    const roleName = roleResult.rows.length > 0 ? roleResult.rows[0].name : 'customer';

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profile_image: user.profile_image,
        role_id: user.role_id,
        role_name: roleName
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// 🔒 Update password
const updatePassword = async (req, res) => {
  try {
    const { mobile, oldPassword, newPassword } = req.body;
    if (!mobile || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await db.query('SELECT password FROM users WHERE mobile = $1', [mobile]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect old password' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = $1 WHERE mobile = $2', [hashedPassword, mobile]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('❌ Error updating password:', err);
    res.status(500).json({ message: 'Database error' });
  }
};



// 👥 Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role_id } = req.query;
    let query = 'SELECT id, name, email, mobile, role_id, profile_image, created_at, status FROM users';
    const params = [];

    if (role_id) {
      query += ' WHERE role_id = $1';
      params.push(role_id);
    }
    
    query += ' ORDER BY id DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error getting all users:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// ➕ Create new user
const createUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role_id = 1 } = req.body;

    if (!mobile || !password || !name) {
      return res.status(400).json({ message: 'Name, mobile and password are required' });
    }

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User with this mobile already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (name, email, mobile, password, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, mobile, role_id',
      [name, email, mobile, hashedPassword, role_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// ✏️ Update user by ID (for Admin)
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, status } = req.body;

    if (!id) return res.status(400).json({ message: 'User ID required' });

    // Build dynamic update query
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (email) {
      updateFields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    if (mobile) {
      updateFields.push(`mobile = $${paramCount}`);
      values.push(mobile);
      paramCount++;
    }
    if (status) {
      updateFields.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error updating user by ID:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

module.exports = {
  getUserByMobile,
  updateUser,
  checkUserExistence,
  loginUser,
  getUserProfile,
  updatePassword,
  getAllUsers,
  createUser,
  updateUserById
};
