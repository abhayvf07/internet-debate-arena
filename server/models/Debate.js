const mongoose = require("mongoose");

// All the allowed topics for a debate
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
            maxlength: 150, // Keep it snappy
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: 2000,
        },
        category: {
            type: String,
            enum: CATEGORIES, // Must match the list above
            default: "Other",
        },
        tags: {
            type: [String], // Optional keywords to help with searching
            default: [],
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Links to the user who started it
            required: true,
        },
        
        // --- Stats Tracking ---
        views: { type: Number, default: 0 },
        votesCount: { type: Number, default: 0 }, // Total votes
        proVotes: { type: Number, default: 0 },
        conVotes: { type: Number, default: 0 },
        argumentsCount: { type: Number, default: 0 }, // Total replies
        
        // Used by our algorithm to figure out what's hot right now
        trendingScore: { type: Number, default: 0 },
        
        // Helps us push recently active debates back to the top
        lastActivityAt: { type: Date, default: Date.now },
    },
    { timestamps: true } // Auto-adds createdAt and updatedAt
);

// --- Indexes for faster database queries ---

// Our wildcard text index to power the search bar!
debateSchema.index({ title: "text", description: "text", tags: "text" });

// Speed up sorting by trending, category, and user profiles
debateSchema.index({ trendingScore: -1 });
debateSchema.index({ category: 1, createdAt: -1 });
debateSchema.index({ creator: 1 });

module.exports = mongoose.model("Debate", debateSchema);
module.exports.CATEGORIES = CATEGORIES;