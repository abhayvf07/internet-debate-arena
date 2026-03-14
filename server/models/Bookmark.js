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

// Each user can only bookmark a debate once
bookmarkSchema.index({ userId: 1, debateId: 1 }, { unique: true });
// Fast bookmark listing per user
bookmarkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
