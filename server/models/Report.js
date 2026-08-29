// Report schema — user reports on arguments with pending/resolved status
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
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
    reason: {
      type: String,
      required: [true, "Report reason is required"],
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true },
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ userId: 1, argumentId: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);