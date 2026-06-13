// Vote schema — one Pro/Con vote per user per debate

const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
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
        side: {
            type: String,
            enum: ["Pro", "Con"],
            required: true,
        },
    },
    { timestamps: true }
);

voteSchema.index({ userId: 1, debateId: 1 }, { unique: true });
voteSchema.index({ debateId: 1, side: 1 });

module.exports = mongoose.model("Vote", voteSchema);
