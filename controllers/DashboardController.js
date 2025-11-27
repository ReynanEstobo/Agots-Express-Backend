import pool from "../config/db.js";

// Dashboard stats (total + today)
export const getDashboardStats = async (req, res) => {
  try {
    // Total Orders
    const [orders] = await pool.query(
      "SELECT COUNT(*) AS totalOrders FROM orders"
    );

    // Total Customers
    const [customers] = await pool.query(
      "SELECT COUNT(*) AS totalCustomers FROM users WHERE role='customer'"
    );

    // Total Revenue (all time completed)
    const [revenue] = await pool.query(
      "SELECT IFNULL(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status='completed'"
    );

    // Today Revenue (only completed today)
    const [todayRevenue] = await pool.query(
      "SELECT IFNULL(SUM(total_amount), 0) AS todayRevenue FROM orders WHERE status='completed' AND DATE(created_at) = CURDATE()"
    );

    // Average Feedback
    const [feedback] = await pool.query(
      "SELECT IFNULL(AVG(rating), 0) AS averageFeedback FROM feedback"
    );

    res.status(200).json({
      totalOrders: orders[0].totalOrders,
      totalCustomers: customers[0].totalCustomers,
      totalRevenue: revenue[0].totalRevenue,
      todayRevenue: todayRevenue[0].todayRevenue,
      averageFeedback: parseFloat(feedback[0].averageFeedback).toFixed(1),
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// Recent orders
export const getRecentOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, u.first_name AS customer_name, o.total_amount, o.status
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Failed to fetch recent orders:", err);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
};

// Orders by hour (today)
export const getOrdersByHour = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT HOUR(created_at) AS hour, COUNT(*) AS orders
      FROM orders
      WHERE DATE(created_at) = CURDATE()
      GROUP BY HOUR(created_at)
      ORDER BY hour
    `);

    const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8AM-8PM
    const data = hours.map((h) => rows.find((r) => r.hour === h)?.orders || 0);
    const labels = hours.map(
      (h) => `${h > 12 ? h - 12 : h}${h >= 12 ? "PM" : "AM"}`
    );

    res.status(200).json({ labels, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders by hour" });
  }
};

// Weekly sales (completed only)
export const getSalesByDay = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DAYNAME(created_at) AS day, IFNULL(SUM(total_amount),0) AS sales
      FROM orders
      WHERE WEEK(created_at, 1) = WEEK(CURDATE(), 1)
        AND status = 'completed'
      GROUP BY DAYNAME(created_at)
    `);

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = weekDays.map(
      (day) => rows.find((r) => r.day.startsWith(day))?.sales || 0
    );

    res.status(200).json({ labels: weekDays, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sales by week" });
  }
};
