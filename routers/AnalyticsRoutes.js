import express from "express";
import {
  getKeyMetrics,
  getRevenueTrend,
  getSalesByGroup,
  getTopItems,
} from "../controllers/AnalyticsController.js";

const router = express.Router();

router.get("/revenue-trend", getRevenueTrend);
router.get("/sales-by-category", getSalesByGroup);
router.get("/top-items", getTopItems);
router.get("/key-metrics", getKeyMetrics);

export default router;
