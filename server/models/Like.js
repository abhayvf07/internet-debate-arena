// Like schema — one like per user per argument
const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    argumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Argument",
      required: true,
    },
  },
  { timestamps: true },
);

likeSchema.index({ userId: 1, argumentId: 1 }, { unique: true });
likeSchema.index({ argumentId: 1 });

module.exports = mongoose.model("Like", likeSchema);