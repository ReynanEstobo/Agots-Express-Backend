import express from "express";
import {
  fetchFeaturedDishes,
  fetchLandingStats,
} from "../controllers/LandingController.js";

const router = express.Router();

// GET landing stats (average rating + total customers)
router.get("/stats", fetchLandingStats);

// GET top featured dishes (completed orders only)
router.get("/featured-dishes", fetchFeaturedDishes);

export default router;
