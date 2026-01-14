const Food = require('../models/foodModel');
const { uploadImage, deleteImage } = require('../utils/imageUpload');

exports.getAllFoods = async (req, res) => {
  try {
    console.log('📥 GET /api/foods - Fetching all foods');
    const { subcategory_id } = req.query;
    
    if (subcategory_id) {
      // Filter foods by subcategory
      console.log(`🔍 Filtering by subcategory_id: ${subcategory_id}`);
      const foods = await Food.getBySubcategory(subcategory_id);
      console.log(`✅ Found ${foods.length} foods for subcategory ${subcategory_id}`);
      res.json(foods);
    } else {
      // Get all foods
      const foods = await Food.getAll();
      console.log(`✅ Found ${foods.length} total foods`);
      res.json(foods);
    }
  } catch (err) {
    console.error('❌ Error in getAllFoods:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: err.message });
  }
};

exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.getById(req.params.id);
    if (!food) {
        return res.status(404).json({ message: 'Food not found' });
    }
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFood = async (req, res) => {
  try {
    console.log('📥 Received food data:', req.body);
    let imagePath = null;
    
    if (req.file) {
      imagePath = await uploadImage(req.file);
    }
    
    // Handle food_type mapping for category-based storage
    const foodData = { ...req.body, image: imagePath };
    
    // Ensure food_type has a default value and limit length to prevent truncation
    if (!foodData.food_type) {
      foodData.food_type = '';
      console.log('📝 Setting empty food_type');
    } else {
      // Limit food_type to 450 characters to prevent truncation (leaving some buffer)
      foodData.food_type = foodData.food_type.substring(0, 450);
      console.log('📝 Setting food_type to:', foodData.food_type);
    }
    
    await Food.create(foodData);
    res.json({ message: 'Food created successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFood = async (req, res) => {
  try {
    let imagePath = null;
    
    if (req.file) {
      // Get the old food data to delete the old image
      const oldFood = await Food.getById(req.params.id);
      if (oldFood && oldFood.image) {
        await deleteImage(oldFood.image);
      }
      
      imagePath = await uploadImage(req.file);
    }
    
    const foodData = { ...req.body };
    if (imagePath) {
      foodData.image = imagePath;
    }
    
    // Handle food_type mapping for category-based storage
    if (!foodData.food_type) {
      foodData.food_type = '';
    } else {
      // Limit food_type to 450 characters to prevent truncation (leaving some buffer)
      foodData.food_type = foodData.food_type.substring(0, 450);
    }
    
    await Food.update(req.params.id, foodData);
    res.json({ message: 'Food updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFood = async (req, res) => {
  try {
    // Get the food data to delete the image
    const food = await Food.getById(req.params.id);
    if (food && food.image) {
      await deleteImage(food.image);
    }
    
    await Food.delete(req.params.id);
    res.json({ message: 'Food deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
