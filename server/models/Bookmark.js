// Bookmark schema — saves which debates a user bookmarked

const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        debateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Debate",
            required: true,
        },
    },
    { timestamps: true }
);

// One bookmark per user per debate
bookmarkSchema.index({ userId: 1, debateId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
