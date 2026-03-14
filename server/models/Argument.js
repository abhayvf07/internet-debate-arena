const mongoose = require("mongoose");

const argumentSchema = new mongoose.Schema(
    {
        debateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Debate",
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: [true, "Argument text is required"],
            trim: true,
            maxlength: 2000,
        },
        side: {
            type: String,
            enum: ["Pro", "Con"],
            required: [true, "Side is required (Pro or Con)"],
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Argument",
            default: null,
        },
        likes: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Indexes
argumentSchema.index({ debateId: 1, createdAt: -1 });
argumentSchema.index({ author: 1 });

module.exports = mongoose.model("Argument", argumentSchema);
