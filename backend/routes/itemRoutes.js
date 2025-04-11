const express = require('express');
const { createItem, getAllItems, updateItem, deleteItem } = require('../controllers/itemController');

const router = express.Router();

// Create Item
router.post('/create', createItem);

// Get All Items
router.get('/', getAllItems);

// Update Item by ID
router.put('/:id', updateItem);

// Delete Item by ID
router.delete('/:id', deleteItem);

module.exports = router;