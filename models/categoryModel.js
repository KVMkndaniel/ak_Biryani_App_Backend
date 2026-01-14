const db = require('../config/db');

class Category {
  // Add other methods following the same pattern
  static async create({ name, image, description }) {
    try {
      const result = await db.query(
        'INSERT INTO categories (name, image, description) VALUES ($1, $2, $3) RETURNING id',
        [name, image, description]
      );
      return this.getById(result.rows[0].id);
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM categories');
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, { name, image, description }) {
    await db.query(
      'UPDATE categories SET name = $1, image = $2, description = $3 WHERE id = $4',
      [name, image, description, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM categories WHERE id = $1', [id]);
    return true;
  }

  // Subcategories
  static async createSubcategory({ name, image, description, category_id }) {
    try {
      console.log('Creating subcategory in database:', { name, image, description, category_id });
      
      const result = await db.query(
        'INSERT INTO subcategories (name, image, description, category_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, image, description, category_id]
      );
      
      console.log('Database insert result:', result.rows[0]);
      const subcategory = await this.getSubcategoryById(result.rows[0].id);
      console.log('Retrieved subcategory:', subcategory);
      return subcategory;
    } catch (error) {
      console.error('Database error creating subcategory:', error);
      throw error;
    }
  }

  static async getSubcategoriesByCategory(category_id) {
    try {
      const result = await db.query(
        'SELECT * FROM subcategories WHERE category_id = $1',
        [category_id]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAllSubcategories() {
    try {
      const result = await db.query(`
        SELECT s.*, c.name as category_name 
        FROM subcategories s 
        LEFT JOIN categories c ON s.category_id = c.id 
        ORDER BY c.name, s.name
      `);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getSubcategoryById(id) {
    const result = await db.query('SELECT * FROM subcategories WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateSubcategory(id, { name, image, description }) {
    await db.query(
      'UPDATE subcategories SET name = $1, image = $2, description = $3 WHERE id = $4',
      [name, image, description, id]
    );
    return this.getSubcategoryById(id);
  }

  static async deleteSubcategory(id) {
    await db.query('DELETE FROM subcategories WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Category;