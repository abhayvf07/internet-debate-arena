// DebateView model — tracks unique views per user per debate
const mongoose = require("mongoose");

const debateViewSchema = new mongoose.Schema(
  {
    debateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Debate",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

// Prevent duplicate views at the database level
debateViewSchema.index({ debateId: 1, userId: 1 }, { unique: true });

// For counting views per debate
debateViewSchema.index({ debateId: 1 });

module.exports = mongoose.model("DebateView", debateViewSchema);