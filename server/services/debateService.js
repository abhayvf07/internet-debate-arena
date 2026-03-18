const Debate = require("../models/Debate");
const Argument = require("../models/Argument");
const Bookmark = require("../models/Bookmark");
const Vote = require("../models/Vote");
const Like = require("../models/Like");
const { paginate } = require("../utils/pagination");
const { emitToDebate } = require("../socket/index");
const { deleteCachePattern } = require("../config/redis");

/**
 * Recalculate and store trendingScore for a debate
 */
const recalcTrendingScore = async (debateId) => {
    const debate = await Debate.findById(debateId);
    if (!debate) return;

    const ageHours =
        (Date.now() - new Date(debate.createdAt).getTime()) / (1000 * 60 * 60);
    const ageFactor = ageHours + 2;

    const rawScore =
        (debate.proVotes + debate.conVotes) * 2 +
        (debate.argumentsCount || 0) * 3 +
        (debate.views || 0);

    const trendingScore = parseFloat((rawScore / ageFactor).toFixed(4));

    await Debate.updateOne({ _id: debateId }, { $set: { trendingScore } });
};

/**
 * Get all debates (paginated, filterable, sortable)
 */
const getDebates = async (query) => {
    const filter = {};

    if (query.category) {
        filter.category = query.category;
    }
    if (query.tag) {
        filter.tags = { $in: [query.tag] };
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (query.sort === "most_voted") {
        sort = { votesCount: -1, createdAt: -1 };
    } else if (query.sort === "trending") {
        sort = { trendingScore: -1, createdAt: -1 };
    }

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

/**
 * Search debates using $text index, fallback to $regex
 */
const searchDebates = async (query) => {
    const { q } = query;

    if (!q) {
        const error = new Error("Search query is required");
        error.statusCode = 400;
        throw error;
    }

    // Try $text search first
    let filter = { $text: { $search: q } };
    let textSearchUsed = true;

    let count = await Debate.countDocuments(filter);
    if (count === 0) {
        // Fallback to $regex for partial matches
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

/**
 * Get trending debates — sorted by stored trendingScore
 */
const getTrendingDebates = async (limit = 10) => {
    return Debate.find()
        .populate("creator", "name")
        .sort({ trendingScore: -1 })
        .limit(limit)
        .lean();
};

/**
 * Get single debate with vote counts and user vote
 */
const getDebateById = async (debateId, userId) => {
    const debate = await Debate.findById(debateId)
        .populate("creator", "name")
        .lean();

    if (!debate) {
        const error = new Error("Debate not found");
        error.statusCode = 404;
        throw error;
    }

    // Check if current user has voted
    let userVoteSide = null;
    if (userId) {
        const userVote = await Vote.findOne({ userId, debateId: debate._id });
        if (userVote) userVoteSide = userVote.side;
    }

    return {
        ...debate,
        userVoteSide,
    };
};

/**
 * Increment view count — atomic $inc
 */
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

    // Recalculate trending score
    await recalcTrendingScore(debateId);

    // Invalidate caches
    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${debateId}*`);

    return { views: debate.views };
};

/**
 * Vote on a debate (Pro or Con) — toggle logic with atomic counters
 */
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
    const oppField = side === "Pro" ? "conVotes" : "proVotes";

    if (!existingVote) {
        // First vote — create it, $inc the right counter
        await Vote.create({ userId, debateId, side });
        await Debate.updateOne(
            { _id: debateId },
            {
                $inc: { [sideField]: 1, votesCount: 1 },
                $set: { lastActivityAt: new Date() },
            }
        );
    } else if (existingVote.side === side) {
        // Same side — remove vote (toggle off)
        await existingVote.deleteOne();
        await Debate.updateOne(
            { _id: debateId },
            {
                $inc: { [sideField]: -1, votesCount: -1 },
                $set: { lastActivityAt: new Date() },
            }
        );
    } else {
        // Different side — switch
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

    // Recalculate trending score
    await recalcTrendingScore(debateId);

    // Get updated debate for response
    const updated = await Debate.findById(debateId).lean();
    const updatedVote = await Vote.findOne({ userId, debateId });

    const result = {
        proVotes: updated.proVotes,
        conVotes: updated.conVotes,
        userVoteSide: updatedVote ? updatedVote.side : null,
    };

    // Invalidate caches BEFORE sending event
    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${debateId}*`);

    // Emit real-time event
    emitToDebate(debateId, "voteUpdated", result);

    return result;
};

/**
 * Create a debate
 */
const createDebate = async ({ title, description, category, tags, userId }) => {
    let parsedTags = [];
    if (tags) {
        parsedTags = Array.isArray(tags)
            ? tags.map((t) => t.trim()).filter(Boolean)
            : tags.split(",").map((t) => t.trim()).filter(Boolean);
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

/**
 * Delete a debate (admin or creator)
 */
const deleteDebate = async (debateId, user) => {
    const debate = await Debate.findById(debateId);

    if (!debate) {
        const error = new Error("Debate not found");
        error.statusCode = 404;
        throw error;
    }

    // Allow admin or the creator to delete
    if (user.role !== "admin" && debate.creator.toString() !== user._id.toString()) {
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error;
    }

    // Clean up related data
    const argIds = await Argument.find({ debateId: debate._id }).distinct("_id");

    await Promise.all([
        Argument.deleteMany({ debateId: debate._id }),
        Bookmark.deleteMany({ debateId: debate._id }),
        Vote.deleteMany({ debateId: debate._id }),
        debate.deleteOne(),
    ]);

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
