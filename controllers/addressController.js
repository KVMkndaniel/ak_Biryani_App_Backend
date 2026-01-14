const db = require('../config/db');

// ✅ Get all addresses for a user
const getAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const result = await db.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error getting addresses:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// ✅ Create new address
const createAddress = async (req, res) => {
  try {
    const { 
      user_id, label, full_address, flat_no, landmark, 
      city, state, pincode, latitude, longitude, is_default 
    } = req.body;

    if (!user_id || !label || !full_address) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // If this is set as default, unset others
    if (is_default) {
      await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [user_id]);
    }

    const result = await db.query(
      `INSERT INTO addresses (
        user_id, label, full_address, flat_no, landmark, 
        city, state, pincode, latitude, longitude, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [user_id, label, full_address, flat_no, landmark, city, state, pincode, latitude, longitude, is_default || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating address:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// ✅ Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      label, full_address, flat_no, landmark, 
      city, state, pincode, latitude, longitude, is_default, user_id
    } = req.body;

    if (is_default && user_id) {
      await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [user_id]);
    }

    const result = await db.query(
      `UPDATE addresses SET 
        label=$1, full_address=$2, flat_no=$3, landmark=$4, 
        city=$5, state=$6, pincode=$7, latitude=$8, longitude=$9, is_default=$10
      WHERE id=$11 RETURNING *`,
      [label, full_address, flat_no, landmark, city, state, pincode, latitude, longitude, is_default, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Address not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error updating address:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

// ✅ Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM addresses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting address:', err);
    res.status(500).json({ message: 'Database error' });
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
