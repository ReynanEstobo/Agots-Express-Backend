import pool from "../config/db.js";

// --------------------
// Get rider info
// --------------------
export const getRiderByIdModel = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, first_name, username, role
     FROM users
     WHERE id = ? AND role = 'rider'`,
    [id]
  );

  if (rows.length === 0) return null;

  const rider = rows[0];
  return {
    id: rider.id,
    name: rider.first_name,
    username: rider.username,
    riderId: `R${String(rider.id).padStart(3, "0")}`,
  };
};

// --------------------
// Get orders assigned to a rider
// --------------------
export const getOrdersByRiderIdModel = async (riderId, status) => {
  let query = `
    SELECT o.id AS order_id,
           o.total_amount,
           o.payment_method,
           o.status,
           o.created_at,
           o.completed_at,
           di.first_name,
           di.last_name,
           di.phone,
           di.email,
           di.address,
           di.delivery_instructions,
           f.rating
    FROM orders o
    JOIN delivery_info di ON o.id = di.order_id
    LEFT JOIN feedback f ON o.id = f.order_id
    WHERE o.rider_id = ?`;

  const params = [riderId];

  if (status) {
    query += " AND o.status = ?";
    params.push(status);
  }

  query += " ORDER BY o.created_at DESC";

  const [orders] = await pool.query(query, params);

  const orderIds = orders.map((o) => o.order_id);
  let itemsMap = {};

  if (orderIds.length > 0) {
    const [items] = await pool.query(
      `SELECT oi.order_id, m.name AS item_name, oi.quantity, oi.price, oi.total
       FROM order_items oi
       JOIN menu m ON oi.menu_id = m.id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    items.forEach((item) => {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      itemsMap[item.order_id].push(item);
    });
  }

  return orders.map((o) => ({
    id: o.order_id,
    total_amount: o.total_amount,
    payment_method: o.payment_method,
    status: o.status,
    created_at: o.created_at,
    completed_at: o.completed_at,
    customer_first_name: o.first_name,
    customer_last_name: o.last_name,
    customer_phone: o.phone,
    customer_email: o.email,
    customer_address: o.address,
    delivery_instructions: o.delivery_instructions,
    items: itemsMap[o.order_id] || [],
    rating: o.rating || 0, // <-- include rating here
  }));
};



// --------------------
// Get stats for rider
// --------------------
export const getRiderStatsModel = async (riderId) => {
  // Fetch completed deliveries for today
  const [todaysDeliveries] = await pool.query(
    `SELECT total_amount
     FROM orders
     WHERE rider_id = ? AND status = 'completed' AND DATE(completed_at) = CURDATE()`,
    [riderId]
  );

  const totalDeliveries = todaysDeliveries.length;
  const totalEarnings = todaysDeliveries.reduce(
    (sum, o) => sum + parseFloat(o.total_amount || 0),
    0
  );

  // Average rating for orders specifically assigned to this rider
  const [ratings] = await pool.query(
    `SELECT f.rating
     FROM feedback f
     JOIN orders o ON f.order_id = o.id
     WHERE o.rider_id = ? AND o.status = 'completed' AND f.rating IS NOT NULL`,
    [riderId]
  );

  const validRatings = ratings
    .map((r) => parseFloat(r.rating))
    .filter((r) => !isNaN(r));

  const avgRating =
    validRatings.length > 0
      ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
      : 0;

  return {
    totalDeliveries,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    avgRating: parseFloat(avgRating.toFixed(2)),
    totalReviews: validRatings.length,
  };
};

// --------------------
// Accept a delivery
// --------------------
export const acceptDeliveryModel = async (riderId, orderId) => {
  const [result] = await pool.query(
    `UPDATE orders
     SET status = 'on the way'
     WHERE id = ? AND rider_id = ? AND status = 'assigned'`,
    [orderId, riderId]
  );
  return result.affectedRows > 0;
};

// --------------------
// Complete a delivery
// --------------------
export const completeDeliveryModel = async (riderId, orderId) => {
  const [result] = await pool.query(
    `UPDATE orders
     SET status = 'completed', completed_at = NOW()
     WHERE id = ? AND rider_id = ? AND status = 'on the way'`,
    [orderId, riderId]
  );
  return result.affectedRows > 0;
};

// --------------------
// Submit rating
// --------------------
export const submitRatingModel = async (orderId, riderId, rating, review) => {
  const [orderCheck] = await pool.query(
    `SELECT id FROM orders WHERE id = ? AND rider_id = ? AND status = 'completed'`,
    [orderId, riderId]
  );
  if (orderCheck.length === 0)
    return { success: false, message: "Invalid order" };

  const [existing] = await pool.query(
    `SELECT id FROM feedback WHERE order_id = ?`,
    [orderId]
  );
  if (existing.length > 0) return { success: false, message: "Already rated" };

  const [result] = await pool.query(
    `INSERT INTO feedback (order_id, rating, review, created_at)
     VALUES (?, ?, ?, NOW())`,
    [orderId, rating, review || null]
  );

  return { success: result.affectedRows > 0 };
};
