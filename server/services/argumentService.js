const Argument = require("../models/Argument");
const Like = require("../models/Like");
const Debate = require("../models/Debate");
const User = require("../models/User");
const { emitToDebate } = require("../socket/index");
const { recalcTrendingScore } = require("./debateService");
const { deleteCachePattern } = require("../config/redis");

/**
 * Create a top-level argument
 */
const createArgument = async ({ debateId, text, side, userId }) => {
    if (!debateId || !text || !side) {
        const error = new Error("debateId, text, and side are required");
        error.statusCode = 400;
        throw error;
    }

    if (!["Pro", "Con"].includes(side)) {
        const error = new Error("Side must be Pro or Con");
        error.statusCode = 400;
        throw error;
    }

    const debate = await Debate.findById(debateId);
    if (!debate) {
        const error = new Error("Debate not found");
        error.statusCode = 404;
        throw error;
    }

    const argument = await Argument.create({
        debateId,
        author: userId,
        text,
        side,
        parentId: null,
    });

    // Atomic increment of argumentsCount + update lastActivityAt
    await Debate.updateOne(
        { _id: debateId },
        {
            $inc: { argumentsCount: 1 },
            $set: { lastActivityAt: new Date() },
        }
    );

    // Recalculate trending score
    await recalcTrendingScore(debateId);

    // Emit real-time event BEFORE returning, cache invalidated BEFORE emit
    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${debateId}*`);

    emitToDebate(debateId, "argumentAdded", populated.toObject());

    return populated;
};

/**
 * Reply to an argument
 */
const replyToArgument = async ({ parentId, text, userId }) => {
    if (!parentId || !text) {
        const error = new Error("parentId and text are required");
        error.statusCode = 400;
        throw error;
    }

    const parent = await Argument.findById(parentId);
    if (!parent) {
        const error = new Error("Parent argument not found");
        error.statusCode = 404;
        throw error;
    }

    const reply = await Argument.create({
        debateId: parent.debateId,
        author: userId,
        text,
        side: parent.side,
        parentId,
    });

    // Atomic increment
    await Debate.updateOne(
        { _id: parent.debateId },
        {
            $inc: { argumentsCount: 1 },
            $set: { lastActivityAt: new Date() },
        }
    );

    await recalcTrendingScore(parent.debateId);

    const populated = await reply.populate("author", "name");

    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${parent.debateId}*`);

    // Emit real-time event
    emitToDebate(parent.debateId, "argumentAdded", populated.toObject());

    return {
        argument: populated,
        alert: parent.author.toString() !== userId.toString()
            ? "Your argument received a reply"
            : null,
    };
};

/**
 * Get arguments for a debate (with nested replies)
 */
const getArgumentsByDebate = async (debateId, userId) => {
    const allArgs = await Argument.find({ debateId })
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .lean();

    // Build nested structure
    const argMap = {};
    const topLevel = [];

    allArgs.forEach((arg) => {
        arg.replies = [];
        argMap[arg._id.toString()] = arg;
    });

    allArgs.forEach((arg) => {
        if (arg.parentId) {
            const parent = argMap[arg.parentId.toString()];
            if (parent) {
                parent.replies.push(arg);
            }
        } else {
            topLevel.push(arg);
        }
    });

    // Attach user likes
    let userLikes = {};
    if (userId) {
        const likes = await Like.find({
            userId,
            argumentId: { $in: allArgs.map((a) => a._id) },
        });
        likes.forEach((l) => {
            userLikes[l.argumentId.toString()] = true;
        });
    }

    return { arguments: topLevel, userLikes };
};

/**
 * Like/unlike an argument (toggle)
 */
const likeArgument = async (argumentId, userId) => {
    if (!argumentId) {
        const error = new Error("argumentId is required");
        error.statusCode = 400;
        throw error;
    }

    const argument = await Argument.findById(argumentId);
    if (!argument) {
        const error = new Error("Argument not found");
        error.statusCode = 404;
        throw error;
    }

    // Prevent self-like
    if (argument.author.toString() === userId.toString()) {
        const error = new Error("You cannot like your own argument");
        error.statusCode = 403;
        throw error;
    }

    const existingLike = await Like.findOne({ userId, argumentId });
    let liked, alert;

    if (existingLike) {
        // Unlike
        await existingLike.deleteOne();
        argument.likes = Math.max(0, argument.likes - 1);
        await argument.save();
        await User.findByIdAndUpdate(argument.author, { $inc: { points: -1 } });
        liked = false;
        alert = null;
    } else {
        // Like
        await Like.create({ userId, argumentId });
        argument.likes += 1;
        await argument.save();
        await User.findByIdAndUpdate(argument.author, { $inc: { points: 1 } });
        liked = true;
        alert = "Someone liked your argument";
    }

    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${argument.debateId}*`);

    return { liked, likes: argument.likes, alert };
};

/**
 * Delete an argument
 */
const deleteArgument = async (argumentId, userId, userRole) => {
    const argument = await Argument.findById(argumentId);
    
    if (!argument) {
        const error = new Error("Argument not found");
        error.statusCode = 404;
        throw error;
    }

    if (argument.author.toString() !== userId.toString() && userRole !== "admin") {
        const error = new Error("Not authorized to delete this argument");
        error.statusCode = 403;
        throw error;
    }

    // Attempt to delete replies before deleting the parent
    const repliesCount = await Argument.countDocuments({ parentId: argumentId });

    await Argument.deleteMany({ parentId: argumentId });
    await argument.deleteOne();

    // Decrement the debate argument count by 1 + total replies
    await Debate.updateOne(
        { _id: argument.debateId },
        {
            $inc: { argumentsCount: -(1 + repliesCount) },
            $set: { lastActivityAt: new Date() },
        }
    );

    // Also remove likes related to this argument
    await Like.deleteMany({ argumentId });

    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${argument.debateId}*`);

    return { message: "Argument deleted successfully" };
};

module.exports = {
    createArgument,
    replyToArgument,
    getArgumentsByDebate,
    likeArgument,
    deleteArgument,
};
