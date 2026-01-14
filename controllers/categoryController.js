const Category = require('../models/categoryModel');
const { uploadImage, deleteImage } = require('../utils/imageUpload');

const categoryController = {
  // Categories
  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      let image = null;
      
      if (req.file) {
        image = await uploadImage(req.file);
      }
  
      const category = await Category.create({ name, image, description });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
},

  getAllCategories: async (req, res) => {
    try {
      console.log('📥 GET /api/categories - Fetching all categories');
      const categories = await Category.getAll();
      console.log(`✅ Found ${categories.length} categories`);
      res.json(categories);
    } catch (error) {
      console.error('❌ Error in getAllCategories:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: error.message });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const category = await Category.getById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      let image;

      const currentCategory = await Category.getById(req.params.id);
      if (!currentCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      if (req.file) {
        image = await uploadImage(req.file);
        if (currentCategory.image) {
          await deleteImage(currentCategory.image);
        }
      }

      const category = await Category.update(req.params.id, { 
        name, 
        image: image || currentCategory.image, 
        description 
      });
      
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.getById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      if (category.image) {
        await deleteImage(category.image);
      }
      await Category.delete(req.params.id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Subcategories
  createSubcategory: async (req, res) => {
    try {
      console.log('Creating subcategory with body:', req.body);
      console.log('File:', req.file);
      
      const { name, description, category_id } = req.body;
      
      if (!name || !category_id) {
        return res.status(400).json({ error: 'Name and category_id are required' });
      }
      
      const image = req.file ? await uploadImage(req.file) : null;

      const subcategory = await Category.createSubcategory({ 
        name, 
        image, 
        description, 
        category_id 
      });
      
      console.log('Subcategory created:', subcategory);
      res.status(201).json(subcategory);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      res.status(400).json({ error: error.message });
    }
  },

  getSubcategories: async (req, res) => {
    try {
      const subcategories = await Category.getSubcategoriesByCategory(req.params.categoryId);
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllSubcategories: async (req, res) => {
    try {
      const subcategories = await Category.getAllSubcategories();
      res.json(subcategories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateSubcategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      let image;

      const currentSubcategory = await Category.getSubcategoryById(req.params.id);
      if (!currentSubcategory) {
        return res.status(404).json({ error: 'Subcategory not found' });
      }
      
      if (req.file) {
        image = await uploadImage(req.file);
        if (currentSubcategory.image) {
          await deleteImage(currentSubcategory.image);
        }
      }

      const subcategory = await Category.updateSubcategory(req.params.id, { 
        name, 
        image: image || currentSubcategory.image, 
        description 
      });
      
      res.json(subcategory);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteSubcategory: async (req, res) => {
    try {
      const subcategory = await Category.getSubcategoryById(req.params.id);
      if (!subcategory) {
        return res.status(404).json({ error: 'Subcategory not found' });
      }
      if (subcategory.image) {
        await deleteImage(subcategory.image);
      }
      await Category.deleteSubcategory(req.params.id);
      res.json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = categoryController;