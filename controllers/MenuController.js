import * as MenuModel from "../models/MenuModel.js";

// ---------------------- CREATE MENU ITEM ----------------------
export const createMenuItem = async (req, res) => {
  const { name, category, price, description, group } = req.body;

  try {
    // Handle "None" category properly, set it to null if not provided
    const validCategory = category === "None" ? null : category; // Convert "None" to null
    const newMenuItem = await MenuModel.addMenuItem(
      name,
      validCategory, // Allow category to be null or undefined
      price,
      description,
      group
    );

    res.status(201).json({
      id: newMenuItem.id,
      name,
      category: newMenuItem.category || "None", // Return "None" if category is null
      price,
      description,
      group,
    });
  } catch (err) {
    console.error("Failed to create menu item:", err.message);
    res
      .status(500)
      .json({ message: "Failed to create menu item", error: err.message });
  }
};

// ---------------------- UPDATE MENU ITEM ----------------------
export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, group } = req.body;

  try {
    // Handle "None" category properly, set it to null if not provided
    const updatedCategory = category === "None" ? null : category; // Convert "None" to null
    const updated = await MenuModel.updateMenuItem(id, {
      name,
      category: updatedCategory, // Allow category to be null or undefined
      price,
      description,
      group,
    });

    if (!updated) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({
      id,
      name,
      category: updatedCategory || "None", // Return "None" if category is null
      price,
      description,
      group,
    });
  } catch (err) {
    console.error("Error updating menu item:", err.message);
    res
      .status(500)
      .json({ message: "Failed to update menu item", error: err.message });
  }
};

// ---------------------- DELETE MENU ITEM ----------------------
export const deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await MenuModel.deleteMenuItem(id);
    if (!deleted) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error("Failed to delete menu item:", err);
    res.status(500).json({ message: "Failed to delete menu item" });
  }
};

// ---------------------- GET ALL MENU ITEMS ----------------------
export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuModel.getAllMenuItems();
    // Ensure categories are returned as "None" if they are null in the DB
    const formattedItems = menuItems.map((item) => ({
      ...item,
      category: item.category || "None", // Convert null category to "None"
    }));
    res.status(200).json(formattedItems); // Return the list of menu items
  } catch (err) {
    console.error("Failed to fetch menu items:", err.message);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
};

// ---------------------- GET MENU ITEM BY ID ----------------------
export const getMenuItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const menuItem = await MenuModel.getMenuItemById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    // Ensure the category is returned as "None" if it is null in the DB
    res.status(200).json({
      ...menuItem,
      category: menuItem.category || "None", // Convert null category to "None"
    });
  } catch (err) {
    console.error("Failed to fetch menu item:", err.message);
    res.status(500).json({ message: "Failed to fetch menu item" });
  }
};
