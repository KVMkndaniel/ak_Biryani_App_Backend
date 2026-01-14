const db = require('./config/db');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Insert categories
    console.log('\n📝 Inserting categories...');
    const categories = [
      { name: 'Biryani', description: 'Delicious rice dishes with meat and spices' },
      { name: 'Starters', description: 'Appetizers and snacks' },
      { name: 'Main Course', description: 'Full meals and curries' },
      { name: 'Desserts', description: 'Sweet treats' },
      { name: 'Beverages', description: 'Drinks and refreshments' }
    ];
    
    const categoryIds = [];
    for (const cat of categories) {
      const result = await db.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
        [cat.name, cat.description]
      );
      categoryIds.push({ name: cat.name, id: result.rows[0].id });
      console.log(`✅ Created category: ${cat.name} (ID: ${result.rows[0].id})`);
    }
    
    // Insert subcategories
    console.log('\n📝 Inserting subcategories...');
    const biryaniCatId = categoryIds.find(c => c.name === 'Biryani').id;
    const startersCatId = categoryIds.find(c => c.name === 'Starters').id;
    
    const subcategories = [
      { name: 'Chicken Biryani', category_id: biryaniCatId, description: 'Chicken biryani varieties' },
      { name: 'Mutton Biryani', category_id: biryaniCatId, description: 'Mutton biryani varieties' },
      { name: 'Veg Biryani', category_id: biryaniCatId, description: 'Vegetarian biryani options' },
      { name: 'Non-Veg Starters', category_id: startersCatId, description: 'Non-vegetarian appetizers' },
      { name: 'Veg Starters', category_id: startersCatId, description: 'Vegetarian appetizers' }
    ];
    
    const subcategoryIds = [];
    for (const subcat of subcategories) {
      const result = await db.query(
        'INSERT INTO subcategories (name, description, category_id) VALUES ($1, $2, $3) RETURNING id',
        [subcat.name, subcat.description, subcat.category_id]
      );
      subcategoryIds.push({ name: subcat.name, id: result.rows[0].id });
      console.log(`✅ Created subcategory: ${subcat.name} (ID: ${result.rows[0].id})`);
    }
    
    // Insert foods
    console.log('\n📝 Inserting foods...');
    const chickenBiryaniId = subcategoryIds.find(s => s.name === 'Chicken Biryani').id;
    const muttonBiryaniId = subcategoryIds.find(s => s.name === 'Mutton Biryani').id;
    const vegBiryaniId = subcategoryIds.find(s => s.name === 'Veg Biryani').id;
    
    const foods = [
      {
        name: 'Hyderabadi Chicken Biryani',
        amount: 250,
        discount: 20,
        description: 'Authentic Hyderabadi style chicken biryani with aromatic spices',
        subcategory_id: chickenBiryaniId,
        customer_rate: 4.5,
        offer_details: '20% OFF',
        food_type: 'Non-Veg'
      },
      {
        name: 'Chicken Dum Biryani',
        amount: 280,
        discount: 30,
        description: 'Slow-cooked chicken biryani in traditional dum style',
        subcategory_id: chickenBiryaniId,
        customer_rate: 4.7,
        offer_details: '30% OFF',
        food_type: 'Non-Veg'
      },
      {
        name: 'Mutton Biryani Special',
        amount: 350,
        discount: 40,
        description: 'Premium mutton biryani with tender meat pieces',
        subcategory_id: muttonBiryaniId,
        customer_rate: 4.8,
        offer_details: '40% OFF',
        food_type: 'Non-Veg'
      },
      {
        name: 'Hyderabadi Mutton Biryani',
        amount: 380,
        discount: 50,
        description: 'Royal Hyderabadi mutton biryani with rich flavors',
        subcategory_id: muttonBiryaniId,
        customer_rate: 4.9,
        offer_details: '50% OFF',
        food_type: 'Non-Veg'
      },
      {
        name: 'Vegetable Biryani',
        amount: 180,
        discount: 15,
        description: 'Mixed vegetable biryani with fragrant basmati rice',
        subcategory_id: vegBiryaniId,
        customer_rate: 4.3,
        offer_details: '15% OFF',
        food_type: 'Veg'
      },
      {
        name: 'Paneer Biryani',
        amount: 220,
        discount: 25,
        description: 'Cottage cheese biryani with aromatic spices',
        subcategory_id: vegBiryaniId,
        customer_rate: 4.4,
        offer_details: '25% OFF',
        food_type: 'Veg'
      }
    ];
    
    for (const food of foods) {
      await db.query(
        `INSERT INTO foods (name, amount, discount, description, subcategory_id, customer_rate, offer_details, food_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [food.name, food.amount, food.discount, food.description, food.subcategory_id, food.customer_rate, food.offer_details, food.food_type]
      );
      console.log(`✅ Created food: ${food.name}`);
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    
    // Verify the data
    const categoriesCount = await db.query('SELECT COUNT(*) FROM categories');
    const subcategoriesCount = await db.query('SELECT COUNT(*) FROM subcategories');
    const foodsCount = await db.query('SELECT COUNT(*) FROM foods');
    
    console.log('\n📊 Final counts:');
    console.log(`Categories: ${categoriesCount.rows[0].count}`);
    console.log(`Subcategories: ${subcategoriesCount.rows[0].count}`);
    console.log(`Foods: ${foodsCount.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
