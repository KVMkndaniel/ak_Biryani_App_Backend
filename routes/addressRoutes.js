const express = require('express');
const router = express.Router();
const { 
  getAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress 
} = require('../controllers/addressController');

// All endpoints prefix linked in index.js to /api/addresses
router.get('/:userId', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
