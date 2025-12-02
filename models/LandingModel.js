import db from "../config/db.js";

// Get average rating from feedback table
export const getAverageRating = async () => {
  const [rows] = await db.query(`
    SELECT ROUND(AVG(rating), 1) AS avg_rating
    FROM feedback
  `);
  return rows[0].avg_rating || 0;
};

// Get total number of customers from users table
export const getCustomerCount = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total_customers
    FROM users
    WHERE role = 'customer'
  `);
  return rows[0].total_customers || 0;
};

// Get top 4 most selling dishes based on completed orders only
export const getTopSellingDishes = async () => {
  const [rows] = await db.query(`
    SELECT m.id, m.name, m.price, m.description, m.category, m.group, m.image,
           SUM(oi.quantity) AS total_sold
    FROM menu m
    JOIN order_items oi ON m.id = oi.menu_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed'
    GROUP BY m.id
    ORDER BY total_sold DESC
    LIMIT 4
  `);
  return rows;
};
