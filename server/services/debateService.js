const Debate = require("../models/Debate");
const Argument = require("../models/Argument");
const Bookmark = require("../models/Bookmark");
const Vote = require("../models/Vote");
const Like = require("../models/Like");
const { paginate } = require("../utils/pagination");
const { emitToDebate } = require("../socket/index");
const { deleteCachePattern } = require("../config/redis");

// Calculate how "hot" a debate is right now based on engagement and age
const recalcTrendingScore = async (debateId) => {
    const debate = await Debate.findById(debateId);
    if (!debate) return;

    const ageHours = (Date.now() - new Date(debate.createdAt).getTime()) / (1000 * 60 * 60);
    const ageFactor = ageHours + 2;

    const rawScore = (debate.proVotes + debate.conVotes) * 2 + (debate.argumentsCount || 0) * 3 + (debate.views || 0);
    const trendingScore = parseFloat((rawScore / ageFactor).toFixed(4));

    await Debate.updateOne({ _id: debateId }, { $set: { trendingScore } });
};

// Fetch a list of debates with filters, sorting, and pagination
const getDebates = async (query) => {
    const filter = {};

    if (query.category) filter.category = query.category;
    if (query.tag) filter.tags = { $in: [query.tag] };
    if (query.creator) filter.creator = query.creator;

    // Figure out how to sort the results
    let sort = { createdAt: -1 };
    if (query.sort === "most_voted") sort = { votesCount: -1, createdAt: -1 };
    else if (query.sort === "trending") sort = { trendingScore: -1, createdAt: -1 };

    const data = await paginate(Debate, filter, query, {
        populate: { path: "creator", select: "name" },
        sort,
    });

    return {
        debates: data.results,
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
    };
};

// Search debates using the text index, with a regex fallback just in case
const searchDebates = async (query) => {
    const { q } = query;

    if (!q) {
        const error = new Error("Search query is required");
        error.statusCode = 400;
        throw error;
    }

    // Try finding exact word matches first
    let filter = { $text: { $search: q } };
    let textSearchUsed = true;

    let count = await Debate.countDocuments(filter);
    if (count === 0) {
        // Fall back to scanning for partial matches if nothing was found
        textSearchUsed = false;
        filter = {
            $or: [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { tags: { $regex: q, $options: "i" } },
            ],
        };
    }

    const data = await paginate(Debate, filter, query, {
        populate: { path: "creator", select: "name" },
        ...(textSearchUsed && { sort: { score: { $meta: "textScore" } } }),
    });

    return {
        debates: data.results,
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
    };
};

// Grab the top debates based on their trending score
const getTrendingDebates = async (limit = 10) => {
    return Debate.find()
        .populate("creator", "name")
        .sort({ trendingScore: -1 })
        .limit(limit)
        .lean();
};

// Load a specific debate and attach the user's current vote if they are logged in
const getDebateById = async (debateId, userId) => {
    const debate = await Debate.findById(debateId)
        .populate("creator", "name")
        .lean();

    if (!debate) {
        const error = new Error("Debate not found");
        error.statusCode = 404;
        throw error;
    }

    let userVoteSide = null;
    if (userId) {
        const userVote = await Vote.findOne({ userId, debateId: debate._id });
        if (userVote) userVoteSide = userVote.side;
    }

    return { ...debate, userVoteSide };
};

// Bump the view count when someone opens the debate
const incrementView = async (debateId) => {
    const debate = await Debate.findByIdAndUpdate(
        debateId,
        {
            $inc: { views: 1 },
            $set: { lastActivityAt: new Date() },
        },
        { new: true }
    );

    if (!debate) {
        const error = new Error("Debate not found");
        error.statusCode = 404;
        throw error;
    }

    await recalcTrendingScore(debateId);

    // Clear caches so the new view count shows up
    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${debateId}*`);

    return { views: debate.views };
};

// Handle Pro/Con voting (adding, removing, or switching sides)
const voteOnDebate = async (debateId, side, userId) => {
    if (!side || !["Pro", "Con"].includes(side)) {
        const error = new Error("side must be Pro or Con");
        error.statusCode = 400;
        throw error;
    }

    const debate = await Debate.findById(debateId);
    if (!debate) {
        const error = new Error("Debate not found");
        error.statusCode = 404;
        throw error;
    }

    const existingVote = await Vote.findOne({ userId, debateId });
    const sideField = side === "Pro" ? "proVotes" : "conVotes";

    if (!existingVote) {
        // Add a brand new vote
        await Vote.create({ userId, debateId, side });
        await Debate.updateOne(
            { _id: debateId },
            {
                $inc: { [sideField]: 1, votesCount: 1 },
                $set: { lastActivityAt: new Date() },
            }
        );
    } else if (existingVote.side === side) {
        // Remove the vote if they clicked the same side again
        await existingVote.deleteOne();
        await Debate.updateOne(
            { _id: debateId },
            {
                $inc: { [sideField]: -1, votesCount: -1 },
                $set: { lastActivityAt: new Date() },
            }
        );
    } else {
        // Switch their vote to the other side
        const oldField = existingVote.side === "Pro" ? "proVotes" : "conVotes";
        existingVote.side = side;
        await existingVote.save();
        await Debate.updateOne(
            { _id: debateId },
            {
                $inc: { [sideField]: 1, [oldField]: -1 },
                $set: { lastActivityAt: new Date() },
            }
        );
    }

    await recalcTrendingScore(debateId);

    const updated = await Debate.findById(debateId).lean();
    const updatedVote = await Vote.findOne({ userId, debateId });

    const result = {
        proVotes: updated.proVotes,
        conVotes: updated.conVotes,
        userVoteSide: updatedVote ? updatedVote.side : null,
    };

    // Clear cache before pushing live updates
    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${debateId}*`);

    try {
        emitToDebate(debateId, "voteUpdated", result);
    } catch (err) {
        console.error("Socket emit failed (voteUpdated):", err.message);
    }

    return result;
};

// Start a new debate
const createDebate = async ({ title, description, category, tags, userId }) => {
    let parsedTags = [];
    if (tags) {
        parsedTags = Array.isArray(tags)
            ? tags.map((t) => t.trim()).filter(Boolean)
            : tags.split(",").map((t) => t.trim()).filter(Boolean);
        parsedTags = parsedTags.slice(0, 10); // Cap it at 10 tags
    }

    const debate = await Debate.create({
        title,
        description,
        category,
        tags: parsedTags,
        creator: userId,
    });

    const populated = await debate.populate("creator", "name");
    await deleteCachePattern("debates:*");

    return populated;
};

// Delete a debate and safely clean up all its attached arguments, votes, etc.
const deleteDebate = async (debateId, user) => {
    const debate = await Debate.findById(debateId);

    if (!debate) {
        const error = new Error("Debate not found");
        error.statusCode = 404;
        throw error;
    }

    // Only let the creator or an admin delete it
    if (user.role !== "admin" && debate.creator.toString() !== user._id.toString()) {
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error;
    }

    const argIds = await Argument.find({ debateId: debate._id }).distinct("_id");

    // Nuke everything related to this debate
    await Promise.all([
        Argument.deleteMany({ debateId: debate._id }),
        Bookmark.deleteMany({ debateId: debate._id }),
        Vote.deleteMany({ debateId: debate._id }),
        debate.deleteOne(),
    ]);

    // Also clean up likes on those deleted arguments
    if (argIds.length > 0) {
        await Like.deleteMany({ argumentId: { $in: argIds } });
    }

    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${debateId}*`);

    return { message: "Debate removed" };
};

module.exports = {
    getDebates,
    searchDebates,
    getTrendingDebates,
    getDebateById,
    incrementView,
    voteOnDebate,
    createDebate,
    deleteDebate,
    recalcTrendingScore,
};