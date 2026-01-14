const db = require('../config/db');

const initDB = async () => {
  try {
    // Create roles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      );
    `);
    console.log('✅ roles table ready');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        mobile VARCHAR(15),
        password VARCHAR(255),
        role_id INT,
        profile_image VARCHAR(255),
        address TEXT,
        bio TEXT,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      );
    `);
    console.log('✅ users table ready');

    // Insert default roles if not exists
    const defaultRoles = ['customer', 'owner', 'admin'];
    for (const role of defaultRoles) {
      // Use PostgreSQL ON CONFLICT syntax
      await db.query(`
        INSERT INTO roles (name) VALUES ($1)
        ON CONFLICT (name) DO NOTHING
      `, [role]);
    }
    console.log('✅ Default roles ready');

    // Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Categories table ready');

    // Create subcategories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        description TEXT,
        category_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Subcategories table ready');

    // ✅ Create foods table with FK to subcategories
    await db.query(`
      CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        offer_details VARCHAR(255),
        customer_rate DECIMAL(2,1),
        food_type VARCHAR(500),
        amount DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2),
        description TEXT,
        subcategory_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Foods table ready');

    // Create cart table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        food_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
        UNIQUE (user_id, food_id)
      );
    `);
    console.log('✅ Cart table ready');

    // Create orders table
    // PostgreSQL doesn't support ENUM strictly inline safely without types, but we can use check constraints or create types.
    // Simplifying with VARCHAR and CHECK constraint for portability.
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash_on_delivery', 'upi')),
        delivery_address TEXT NOT NULL,
        user_name VARCHAR(100),
        user_email VARCHAR(100),
        user_mobile VARCHAR(15),
        order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'approved', 'rejected', 'delivered')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Orders table ready');

    // Create order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT NOT NULL,
        food_id INT,
        food_name VARCHAR(255) NOT NULL,
        food_image VARCHAR(255),
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Order items table ready');

    // Create notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        food_id INT,
        order_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Notifications table ready');

    // Create order_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_history (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT,
        food_id INT,
        order_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Order History table ready');

    // Insert default categories if they don't exist
    console.log('\n🌱 Seeding default categories...');
    
    const defaultCategories = [
      { name: 'Non-Veg', description: 'Non-vegetarian food items' },
      { name: 'Veg', description: 'Vegetarian food items' }
    ];
    
    for (const category of defaultCategories) {
      // Check if category already exists
      const existingCategory = await db.query(
        'SELECT id FROM categories WHERE name = $1',
        [category.name]
      );
      
      if (existingCategory.rows.length === 0) {
        // Insert the category
        const result = await db.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          [category.name, category.description]
        );
        console.log(`✅ Created default category: ${category.name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`ℹ️  Category "${category.name}" already exists (ID: ${existingCategory.rows[0].id})`);
      }
    }

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

module.exports = initDB;

// Allow running directly to seed/init DB
if (require.main === module) {
  initDB().then(() => {
    console.log('✅ InitDB executed manually');
    process.exit(0);
  }).catch((err) => {
    console.error('❌ InitDB failed:', err);
    process.exit(1);
  });
}
