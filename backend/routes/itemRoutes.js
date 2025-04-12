const express = require('express');
const { createItem, getAllItems, updateItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create Item
router.post('/create', protect, createItem);

// Get All Items
router.get('/', getAllItems);

// Update Item by ID
router.put('/:id', protect, updateItem);

// Delete Item by ID
router.delete('/:id', protect, deleteItem);

module.exports = router;