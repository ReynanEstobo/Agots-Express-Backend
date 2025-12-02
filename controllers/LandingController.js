import {
  getAverageRating,
  getCustomerCount,
  getTopSellingDishes,
} from "../models/LandingModel.js";

// Fetch stats for landing page (average rating + total customers)
export const fetchLandingStats = async (req, res) => {
  try {
    const avgRating = await getAverageRating();
    const totalCustomers = await getCustomerCount();

    // Emit live update to all connected clients
    if (req.app.locals.io) {
      req.app.locals.io.emit("landingStatsUpdate", {
        avgRating,
        totalCustomers,
      });
    }

    res.json({ avgRating, totalCustomers });
  } catch (err) {
    console.error("Error fetching landing stats:", err);
    res.status(500).json({ message: "Failed to fetch landing stats" });
  }
};

// Fetch top 4 most selling dishes (completed orders only)
export const fetchFeaturedDishes = async (req, res) => {
  try {
    const dishes = await getTopSellingDishes();

    // Emit live update for featured dishes
    if (req.app.locals.io) {
      req.app.locals.io.emit("featuredDishesUpdate", dishes);
    }

    res.json(dishes);
  } catch (err) {
    console.error("Error fetching featured dishes:", err);
    res.status(500).json({ message: "Failed to fetch featured dishes" });
  }
};
