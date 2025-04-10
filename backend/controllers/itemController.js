const mongoose = require('mongoose');
const Item = require('../models/Item');

const createItem = async (req, res) => {
  try {
    const { name, description, location, status, category } = req.body;

    if (!name?.trim() || !description?.trim() || !location?.trim() || !status?.trim()) {
      return res.status(400).json({ message: "All fields except image & category are required" });
    }

    // Hardcode user ID till JWT added
    const userId = new mongoose.Types.ObjectId("67f7cb020e8dc363cb664ec6");

    const item = await Item.create({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      status: status.trim(),
      category: category?.trim() || 'other',
      user: userId
    });

    res.status(201).json({
      message: "Item created successfully",
      data: item
    });

  } catch (error) {
    console.log("Error while creating item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createItem };