const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the category
 *         name:
 *           type: string
 *           description: The name of the category
 *         image:
 *           type: string
 *           description: The URL of the category image
 *       example:
 *         name: Biryani
 *         image: http://example.com/biryani.jpg
 */


// Categories CRUD

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The created category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  categoryController.createCategory
);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Returns the list of all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: The list of the categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', categoryController.getAllCategories);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Categories API is working!', 
    timestamp: new Date().toISOString(),
    url: req.url,
    path: req.path
  });
});

// Debug endpoint to test exact route matching
router.get('/debug-subcategories', (req, res) => {
  res.json({ 
    message: 'Debug subcategories endpoint working!', 
    timestamp: new Date().toISOString(),
    url: req.url,
    path: req.path
  });
});

// Subcategories CRUD - Place specific routes before parameterized routes
router.get('/subcategories', (req, res) => {
  categoryController.getAllSubcategories(req, res);
});

router.put(
  '/subcategories/:id',
  authMiddleware,
  upload.single('image'),
  categoryController.updateSubcategory
);

router.delete(
  '/subcategories/:id',
  authMiddleware,
  categoryController.deleteSubcategory
);

router.post(
  '/:categoryId/subcategories',
  authMiddleware,
  upload.single('image'),
  (req, res, next) => {
    console.log('Subcategory creation route hit');
    console.log('Category ID:', req.params.categoryId);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    next();
  },
  categoryController.createSubcategory
);

router.get('/:categoryId/subcategories', (req, res) => {
  categoryController.getSubcategories(req, res);
});

// Category specific routes - Place after subcategory routes

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get the category by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The category id
 *     responses:
 *       200:
 *         description: The category description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: The category was not found
 */
router.get('/:id', (req, res) => {
  categoryController.getCategoryById(req, res);
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update the category by the id
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The category id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The category was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: The category was not found
 *       500:
 *         description: server error
 */
router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  categoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Remove the category by id
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The category id
 *     responses:
 *       200:
 *         description: The category was deleted
 *       404:
 *         description: The category was not found
 */
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;