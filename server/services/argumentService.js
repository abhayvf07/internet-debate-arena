// Argument service — create, reply, like, delete arguments with real-time updates

const Argument = require("../models/Argument");
const Like = require("../models/Like");
const Debate = require("../models/Debate");
const User = require("../models/User");
const { emitToDebate } = require("../socket/index");
const { recalcTrendingScore } = require("./debateService");
const { deleteCachePattern } = require("../config/redis");

// Recursively delete an argument and all its nested replies
const deleteArgumentAndReplies = async (argumentId) => {
    let deletedCount = 1;
    const replies = await Argument.find({ parentId: argumentId }).distinct('_id');
    
    for (const replyId of replies) {
        deletedCount += await deleteArgumentAndReplies(replyId); 
    }
    
    await Like.deleteMany({ argumentId });
    await Argument.findByIdAndDelete(argumentId);

    return deletedCount;
};

// Create a new top-level argument
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

    const populated = await argument.populate("author", "name");

    await Debate.updateOne(
        { _id: debateId },
        {
            $inc: { argumentsCount: 1 },
            $set: { lastActivityAt: new Date() },
        }
    );

    await recalcTrendingScore(debateId);
    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${debateId}*`);

    // Broadcast to debate room
    try {
        emitToDebate(debateId, "argumentAdded", populated.toObject());
    } catch (err) {
        console.error("Socket emit failed in createArgument:", err.message);
    }

    return populated;
};

// Reply to an existing argument
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

    try {
        emitToDebate(parent.debateId, "argumentAdded", populated.toObject());
    } catch (err) {
        console.error("Socket emit failed in replyToArgument:", err.message);
    }

    return {
        argument: populated,
        alert: parent.author.toString() !== userId.toString()
            ? "Your argument received a reply"
            : null,
    };
};

// Get all arguments for a debate as a nested tree
const getArgumentsByDebate = async (debateId, userId) => {
    const allArgs = await Argument.find({ debateId })
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();

    const argMap = {};
    const topLevel = [];

    allArgs.forEach((arg) => {
        arg.replies = [];
        argMap[arg._id.toString()] = arg;
    });

    // Nest replies under their parent
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

    // Check which arguments the current user has liked
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

// Toggle like on an argument
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

    // Can't like your own argument
    if (argument.author.toString() === userId.toString()) {
        const error = new Error("You cannot like your own argument");
        error.statusCode = 403;
        throw error;
    }

    const existingLike = await Like.findOne({ userId, argumentId });
    let liked, alert;

    if (existingLike) {
        await existingLike.deleteOne();
        argument.likes = Math.max(0, argument.likes - 1);
        await argument.save();
        await User.findByIdAndUpdate(argument.author, { $inc: { points: -1 } });
        liked = false;
        alert = null;
    } else {
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

// Delete an argument and all its replies
const deleteArgument = async (argumentId, userId, userRole) => {
    const argument = await Argument.findById(argumentId);
    
    if (!argument) {
        const error = new Error("Argument not found");
        error.statusCode = 404;
        throw error;
    }

    // Only author or admin can delete
    if (argument.author.toString() !== userId.toString() && userRole !== "admin") {
        const error = new Error("Not authorized to delete this argument");
        error.statusCode = 403;
        throw error;
    }

    const debateId = argument.debateId;
    const totalDeleted = await deleteArgumentAndReplies(argumentId);

    await Debate.updateOne(
        { _id: debateId },
        {
            $inc: { argumentsCount: -totalDeleted },
            $set: { lastActivityAt: new Date() },
        }
    );

    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${debateId}*`);

    return { message: "Argument deleted successfully" };
};

module.exports = {
    createArgument,
    replyToArgument,
    getArgumentsByDebate,
    likeArgument,
    deleteArgument,
};