// Admin service — user management, content moderation, and platform stats

const User = require("../models/User");
const Debate = require("../models/Debate");
const Argument = require("../models/Argument");
const Vote = require("../models/Vote");
const Like = require("../models/Like");
const Bookmark = require("../models/Bookmark");
const Report = require("../models/Report");
const { paginate } = require("../utils/pagination");
const { deleteCache } = require("../config/redis");

// Recursively collect all descendant argument IDs
const collectAllDescendantIds = async (parentId) => {
    const childIds = await Argument.find({ parentId }).distinct("_id");
    let allIds = [...childIds];
    for (const childId of childIds) {
        const deeperIds = await collectAllDescendantIds(childId);
        allIds = allIds.concat(deeperIds);
    }
    return allIds;
};

// Get all users paginated
const getAllUsers = async (query) => {
    const data = await paginate(User, {}, query, {
        select: "-password -refreshToken",
        sort: { createdAt: -1 },
        maxLimit: 200,
    });

    return {
        users: data.results,
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
    };
};

// Delete a debate and all related data
const adminDeleteDebate = async (debateId) => {
    const debate = await Debate.findById(debateId);
    if (!debate) {
        const error = new Error("Debate not found");
        error.statusCode = 404;
        throw error;
    }

    const argIds = await Argument.find({ debateId: debate._id }).distinct("_id");

    await Promise.all([
        Argument.deleteMany({ debateId: debate._id }),
        Bookmark.deleteMany({ debateId: debate._id }),
        Vote.deleteMany({ debateId: debate._id }),
        debate.deleteOne(),
    ]);

    if (argIds.length > 0) {
        await Promise.all([
            Like.deleteMany({ argumentId: { $in: argIds } }),
            Report.deleteMany({ argumentId: { $in: argIds } }),
        ]);
    }

    return { message: "Debate and related data deleted" };
};

// Delete an argument and all nested replies recursively
const adminDeleteArgument = async (argumentId) => {
    const argument = await Argument.findById(argumentId);
    if (!argument) {
        const error = new Error("Argument not found");
        error.statusCode = 404;
        throw error;
    }

    // Collect all descendants (grandchildren, great-grandchildren, etc.)
    const descendantIds = await collectAllDescendantIds(argument._id);
    const allArgIds = [argument._id, ...descendantIds];

    // Delete the argument, all descendants, and their likes/reports
    await Promise.all([
        Argument.deleteMany({ _id: { $in: allArgIds } }),
        Like.deleteMany({ argumentId: { $in: allArgIds } }),
        Report.deleteMany({ argumentId: { $in: allArgIds } }),
    ]);

    // Update debate argument count
    await Debate.updateOne(
        { _id: argument.debateId },
        { $inc: { argumentsCount: -allArgIds.length } }
    );

    return { message: "Argument and related data deleted" };
};

// Get all pending reports
const getReports = async () => {
    return Report.find({ status: "pending" })
        .populate("userId", "name email")
        .populate({
            path: "argumentId",
            populate: { path: "author", select: "name" },
        })
        .sort({ createdAt: -1 });
};

// Toggle ban status on a user
const banUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.role === "admin") {
        const error = new Error("Cannot ban admin users");
        error.statusCode = 400;
        throw error;
    }

    user.isBanned = !user.isBanned;
    user.refreshToken = null;
    await user.save();

    await deleteCache(`user:auth:${user._id.toString()}`);

    return {
        message: user.isBanned ? "User banned" : "User unbanned",
        isBanned: user.isBanned,
    };
};

// Get platform-wide stats
const getAdminStats = async () => {
    const [totalUsers, totalDebates, pendingReports] = await Promise.all([
        User.countDocuments(),
        Debate.countDocuments(),
        Report.countDocuments({ status: "pending" }),
    ]);

    return { totalUsers, totalDebates, pendingReports };
};

module.exports = {
    getAllUsers,
    adminDeleteDebate,
    adminDeleteArgument,
    getReports,
    banUser,
    getAdminStats,
};
