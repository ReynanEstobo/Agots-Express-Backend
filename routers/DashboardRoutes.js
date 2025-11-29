import express from "express";
import {
  getAllOrders,
  getDashboardStats,
  getOrderItems,
  getOrdersByHour,
  getRecentOrders,
  getSalesByDay,
} from "../controllers/DashboardController.js";

const router = express.Router();

// Dashboard stats
router.get("/stats", getDashboardStats);

// Fetch order items
router.get("/order-items/:orderId", getOrderItems);

// Recent orders
router.get("/recent-orders", getRecentOrders);

// Fetch all orders
router.get("/orders", getAllOrders); // ← NEW route

// Orders chart
router.get("/orders-by-hour", getOrdersByHour);

// Sales chart
router.get("/sales-weekly", getSalesByDay);

export default router;
