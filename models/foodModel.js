const db = require('../config/db');

const Food = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM foods');
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query('SELECT * FROM foods WHERE id = $1', [id]);
    return result.rows[0];
  },

  getBySubcategory: async (subcategoryId) => {
    const result = await db.query('SELECT * FROM foods WHERE subcategory_id = $1', [subcategoryId]);
    return result.rows;
  },

  create: async (data) => {
    const {
      name, image, offer_details, customer_rate, food_type,
      amount, discount, description, subcategory_id
    } = data;
    
    // Treat '0' or 0 as null for subcategory_id to avoid FK constraint errors
    const subId = (subcategory_id === 0 || subcategory_id === '0' || !subcategory_id) ? null : subcategory_id;
    
    const result = await db.query(
      `INSERT INTO foods (name, image, offer_details, customer_rate, food_type, amount, discount, description, subcategory_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, image, offer_details, customer_rate, food_type, amount, discount, description, subId]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const {
      name, image, offer_details, customer_rate, food_type,
      amount, discount, description, subcategory_id
    } = data;
    
    // Treat '0' or 0 as null for subcategory_id to avoid FK constraint errors
    const subId = (subcategory_id === 0 || subcategory_id === '0' || !subcategory_id) ? null : subcategory_id;
    
    const result = await db.query(
      `UPDATE foods SET name=$1, image=$2, offer_details=$3, customer_rate=$4, food_type=$5, amount=$6, discount=$7, description=$8, subcategory_id=$9 WHERE id=$10 RETURNING *`,
      [name, image, offer_details, customer_rate, food_type, amount, discount, description, subId, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await db.query('DELETE FROM foods WHERE id = $1', [id]);
    return true;
  }
};

module.exports = Food;
