const Bookmark = require("../models/Bookmark");

/**
 * Toggle bookmark on a debate
 */
const toggleBookmark = async (userId, debateId) => {
    if (!debateId) {
        const error = new Error("debateId is required");
        error.statusCode = 400;
        throw error;
    }

    const existing = await Bookmark.findOne({ userId, debateId });

    if (existing) {
        await existing.deleteOne();
        return { bookmarked: false, message: "Bookmark removed" };
    }

    await Bookmark.create({ userId, debateId });
    return { bookmarked: true, message: "Debate bookmarked" };
};

/**
 * Get user's bookmarked debates
 */
const getBookmarks = async (userId) => {
    const bookmarks = await Bookmark.find({ userId })
        .populate({
            path: "debateId",
            populate: { path: "creator", select: "name" },
        })
        .sort({ createdAt: -1 });

    return bookmarks.map((b) => b.debateId).filter((d) => d !== null);
};

module.exports = { toggleBookmark, getBookmarks };
