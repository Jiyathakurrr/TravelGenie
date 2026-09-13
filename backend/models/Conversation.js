const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "anonymous" },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
