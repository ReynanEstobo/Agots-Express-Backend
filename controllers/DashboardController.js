import pool from "../config/db.js";

// ------------------------- DASHBOARD STATS -------------------------
export const getDashboardStats = async (req, res) => {
  try {
    // --- Total Orders (ALL orders in DB) ---
    const [totalOrdersResult] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders"
    );

    // --- Orders by status ---
    const [orders] = await pool.query(
      "SELECT status, COUNT(*) AS count FROM orders GROUP BY status"
    );

    const statusCounts = {
      pending: 0,
      preparing: 0,
      ready: 0,
      "on the way": 0,
      completed: 0,
    };
    orders.forEach((o) => {
      if (statusCounts.hasOwnProperty(o.status))
        statusCounts[o.status] = o.count;
    });

    // --- Customers ---
    const [totalCustomersResult] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role='customer'"
    );

    res.status(200).json({
      // Orders
      totalOrders: Number(totalOrdersResult[0].total || 0),
      pending: Number(statusCounts.pending),
      preparing: Number(statusCounts.preparing),
      ready: Number(statusCounts.ready),
      onTheWay: Number(statusCounts["on the way"]),
      completed: Number(statusCounts.completed),

      // Customers
      totalCustomers: Number(totalCustomersResult[0].total || 0),
    });
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    res.status(500).json({
      totalOrders: 0,
      pending: 0,
      preparing: 0,
      ready: 0,
      onTheWay: 0,
      completed: 0,
      totalCustomers: 0,
    });
  }
};

// ------------------------- RECENT ORDERS -------------------------
export const getRecentOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, u.first_name AS customer_name, o.total_amount, o.status, o.created_at
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    const formattedRows = rows.map((r) => ({
      ...r,
      total_amount: Number(r.total_amount || 0),
    }));

    res.status(200).json(formattedRows);
  } catch (err) {
    console.error("Failed to fetch recent orders:", err);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
};

// ------------------------- ALL ORDERS -------------------------
export const getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, u.first_name AS customer_name, o.total_amount, o.status, o.created_at
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      ORDER BY o.created_at DESC
    `);

    const formattedRows = rows.map((r) => ({
      ...r,
      total_amount: Number(r.total_amount || 0),
    }));

    res.status(200).json(formattedRows);
  } catch (err) {
    console.error("Failed to fetch all orders:", err);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

// ------------------------- ORDERS BY HOUR -------------------------
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

// ------------------------- SALES WEEKLY -------------------------
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

// ------------------------- ORDER ITEMS -------------------------
export const getOrderItems = async (req, res) => {
  const { orderId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT m.name AS food_name, oi.quantity, oi.price, oi.total
       FROM order_items oi
       JOIN menu m ON m.id = oi.menu_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Failed to fetch order items:", err);
    res.status(500).json({ message: "Failed to fetch order items" });
  }
};

// ------------------------- CUSTOMERS -------------------------
export const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, first_name, email, phone, address, created_at 
      FROM users 
      WHERE role = 'customer'
      ORDER BY created_at DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { first_name, email, phone, address } = req.body;

  try {
    await pool.query(
      `UPDATE users 
       SET first_name = ?, email = ?, phone = ?, address = ? 
       WHERE id = ?`,
      [first_name, email, phone, address, id]
    );

    res.status(200).json({ message: "Customer updated successfully" });
  } catch (err) {
    console.error("Failed to update customer:", err);
    res.status(500).json({ message: "Failed to update customer" });
  }
};