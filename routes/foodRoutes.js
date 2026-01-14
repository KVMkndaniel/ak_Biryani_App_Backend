const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Food:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the food item
 *         name:
 *           type: string
 *           description: The name of the food
 *         description:
 *           type: string
 *           description: The food description
 *         price:
 *           type: number
 *           description: The price of the food
 *         image:
 *           type: string
 *           description: The URL of the food image
 *         category:
 *           type: string
 *           description: The category ID
 *         isVegetarian:
 *           type: boolean
 *           description: Whether the food is vegetarian
 *       example:
 *         name: Chicken Biryani
 *         description: Delicious chicken biryani
 *         price: 15.99
 *         category: 12345
 *         isVegetarian: false
 */

console.log('🍽️ Loading food routes...');

// Test endpoint
router.get('/test', (req, res) => {
  console.log('🧪 Food routes test endpoint hit');
  res.json({ message: 'Food routes are working!', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /foods:
 *   get:
 *     summary: Returns the list of all foods
 *     tags: [Foods]
 *     responses:
 *       200:
 *         description: The list of the foods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Food'
 */
router.get('/', (req, res) => {
  console.log('🍽️ GET /foods endpoint hit');
  foodController.getAllFoods(req, res);
});

/**
 * @swagger
 * /foods/{id}:
 *   get:
 *     summary: Get the food by id
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The food id
 *     responses:
 *       200:
 *         description: The food description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       404:
 *         description: The food was not found
 */
router.get('/:id', (req, res) => {
  console.log('🍽️ GET /foods/:id endpoint hit, id:', req.params.id);
  foodController.getFoodById(req, res);
});

/**
 * @swagger
 * /foods:
 *   post:
 *     summary: Create a new food
 *     tags: [Foods]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               isVegetarian:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The created food.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       500:
 *         description: Some server error
 */
router.post('/', upload.single('image'), (req, res) => {
  console.log('🍽️ POST /foods endpoint hit');
  foodController.createFood(req, res);
});

/**
 * @swagger
 * /foods/{id}:
 *   put:
 *     summary: Update the food by the id
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The food id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               isVegetarian:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The food was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       404:
 *         description: The food was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', upload.single('image'), (req, res) => {
  console.log('🍽️ PUT /foods/:id endpoint hit, id:', req.params.id);
  foodController.updateFood(req, res);
});

/**
 * @swagger
 * /foods/{id}:
 *   delete:
 *     summary: Remove the food by id
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The food id
 *     responses:
 *       200:
 *         description: The food was deleted
 *       404:
 *         description: The food was not found
 */
router.delete('/:id', (req, res) => {
  console.log('🍽️ DELETE /foods/:id endpoint hit, id:', req.params.id);
  foodController.deleteFood(req, res);
});

console.log('✅ Food routes loaded successfully');

module.exports = router;
