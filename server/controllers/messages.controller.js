import { Message } from "../models/Message.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/messages — everything sent to or by the signed-in user
export const listMyMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [{ senderId: req.user._id }, { recipientId: req.user._id }],
  })
    .sort({ createdAt: -1 })
    .populate("senderId", "fullName email")
    .populate("recipientId", "fullName email");
  res.json(messages);
});

// POST /api/messages
export const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, influencerId, subject, body } = req.body;
  if (!recipientId || !body) {
    return res.status(400).json({ error: "recipientId and body are required" });
  }

  const message = await Message.create({
    senderId: req.user._id,
    recipientId,
    influencerId: influencerId || null,
    subject: subject || null,
    body,
  });
  res.status(201).json(message);
});

// PATCH /api/messages/:id/read — recipient marks a message as read
export const markMessageRead = asyncHandler(async (req, res) => {
  const message = await Message.findOneAndUpdate(
    { _id: req.params.id, recipientId: req.user._id },
    { readAt: new Date() },
    { new: true }
  );
  if (!message) return res.status(404).json({ error: "Message not found" });
  res.json(message);
});
