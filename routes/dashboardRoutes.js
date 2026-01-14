const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

// Get dashboard analytics
router.get('/stats', getDashboardStats);

module.exports = router;
