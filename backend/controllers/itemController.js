const mongoose = require('mongoose');
const Item = require('../models/Item');

// Create Item API
const createItem = async (req, res) => {
  try {
    const { name, description, location, status, category } = req.body;

    if (!name?.trim() || !description?.trim() || !location?.trim() || !status?.trim()) {
      return res.status(400).json({ message: "All fields except image & category are required" });
    }

    // Use req.user._id instead of hardcoded user ID
    const userId = req.user._id;

    let item = await Item.create({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      status: status.trim(),
      category: category?.trim() || 'other',
      user: userId
    });
    
    // Populate the user field to include username
    item = await Item.findById(item._id).populate('user', 'username');

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item
    });

  } catch (error) {
    console.log("Error while creating item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Items API
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate('user', 'username');

    res.status(200).json({
      success: true,
      message: "All Items fetched successfully",
      data: items
    });

  } catch (error) {
    console.log("Error while fetching items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Item API
const updateItem = async (req, res) => {
  try {
    // First find the item to check ownership
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Check if user is the owner of this item
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this item" });
    }

    // Now update the item
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'username');

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem
    });

  } catch (error) {
    console.log("Error while updating item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteItem = async (req, res) => {
  try {
    // First find the item to check ownership
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Check if user is the owner of this item
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this item" });
    }

    // Now delete the item
    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Item deleted successfully" });

  } catch (error) {
    console.log("Error while deleting item:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { createItem, getAllItems, updateItem, deleteItem };