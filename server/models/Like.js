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
    { timestamps: true }
);

// Each user can only like an argument once
likeSchema.index({ userId: 1, argumentId: 1 }, { unique: true });
// Fast like counting per argument
likeSchema.index({ argumentId: 1 });

module.exports = mongoose.model("Like", likeSchema);
