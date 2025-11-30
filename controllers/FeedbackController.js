import * as FeedbackModel from "../models/FeedbackModel.js";

// Fetch all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await FeedbackModel.getAllFeedback();
    res.status(200).json(feedback);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch feedback", error: err.message });
  }
};

// Respond to a feedback (add or update)
export const respondToFeedback = async (req, res) => {
  const { id } = req.params; // feedback ID
  const { responder_id, response } = req.body;

  try {
    const feedbackResponse = await FeedbackModel.addOrUpdateFeedbackResponse(
      id,
      responder_id,
      response
    );

    res.status(201).json(feedbackResponse);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send response", error: err.message });
  }
};
