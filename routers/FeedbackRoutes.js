import express from "express";
import {
  getAllFeedback,
  respondToFeedback,
} from "../controllers/FeedbackController.js";

const router = express.Router();

// Get all feedback
router.get("/", getAllFeedback);

// Respond to a feedback (add/update)
router.post("/:id/respond", respondToFeedback);

export default router;
