import pool from "../config/db.js";

// ---------------------- ADD NEW MENU ITEM ----------------------
export const addMenuItem = async (name, category, price, description, group) => {
  // No longer require category to be provided
  if (!name || !price || !description || !group) {
    throw new Error("Name, price, description, and group are required fields");
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO menu (name, category, price, description, `group`) VALUES (?, ?, ?, ?, ?)",
      [name, category === "None" ? null : category, price, description, group]
    );
    return {
      id: result.insertId,
      name,
      category: category === "None" ? null : category, // Store as NULL for "None"
      price,
      description,
      group,
    };
  } catch (err) {
    console.error("Error inserting menu item:", err.message);
    throw new Error("Failed to create menu item");
  }
};


// ---------------------- UPDATE MENU ITEM ----------------------
export const updateMenuItem = async (id, data) => {
  const { name, category, price, description, group } = data;

  // Ensure required fields are provided
  if (!name || !price || !description || !group) {
    throw new Error("Name, price, description, and group are required fields");
  }

  try {
    const updatedCategory = category === "None" ? null : category; // Convert "None" to null

    const [result] = await pool.query(
      "UPDATE menu SET name = ?, category = ?, price = ?, description = ?, `group` = ? WHERE id = ?",
      [name, updatedCategory, price, description, group, id]
    );

    return result.affectedRows > 0; // Return true if the row was updated
  } catch (err) {
    console.error("Error updating menu item:", err.message);
    throw new Error("Failed to update menu item");
  }
};

// ---------------------- GET ALL MENU ITEMS ----------------------
export const getAllMenuItems = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM menu");
    return rows; // Return all rows from the menu table
  } catch (err) {
    console.error("Error fetching menu items:", err.message);
    throw new Error("Failed to fetch menu items");
  }
};

// ---------------------- DELETE MENU ITEM ----------------------
export const deleteMenuItem = async (id) => {
  try {
    const [result] = await pool.query("DELETE FROM menu WHERE id = ?", [id]);
    return result.affectedRows > 0; // Return true if deletion was successful
  } catch (err) {
    console.error("Failed to delete menu item:", err);
    throw new Error("Failed to delete menu item");
  }
};

// ---------------------- GET MENU ITEM BY ID ----------------------
export const getMenuItemById = async (id) => {
  try {
    const [menuItem] = await pool.query("SELECT * FROM menu WHERE id = ?", [id]);
    return menuItem[0]; // Return the first result or undefined if not found
  } catch (err) {
    console.error("Error fetching menu item by ID:", err.message);
    throw new Error("Failed to fetch menu item by ID");
  }
};
