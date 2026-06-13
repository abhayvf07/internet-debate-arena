// Debate schema — topics with categories, tags, vote counts, and trending score

const mongoose = require("mongoose");

const CATEGORIES = [
    "Technology", "Politics", "Society", "Economy", "Education",
    "Environment", "Science", "Ethics", "Business", "Entertainment",
    "Health", "Sports", "Other",
];

const debateSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: 2000,
        },
        category: {
            type: String,
            enum: CATEGORIES,
            default: "Other",
        },
        tags: {
            type: [String],
            default: [],
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        
        // Stats
        views: { type: Number, default: 0 },
        votesCount: { type: Number, default: 0 },
        proVotes: { type: Number, default: 0 },
        conVotes: { type: Number, default: 0 },
        argumentsCount: { type: Number, default: 0 },
        trendingScore: { type: Number, default: 0 },
        lastActivityAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Text search index
debateSchema.index({ title: "text", description: "text", tags: "text" });

// Sort indexes
debateSchema.index({ trendingScore: -1 });
debateSchema.index({ category: 1, createdAt: -1 });
debateSchema.index({ creator: 1 });

module.exports = mongoose.model("Debate", debateSchema);
module.exports.CATEGORIES = CATEGORIES;