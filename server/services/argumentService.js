const Argument = require("../models/Argument");
const Like = require("../models/Like");
const Debate = require("../models/Debate");
const User = require("../models/User");
const { emitToDebate } = require("../socket/index");
const { recalcTrendingScore } = require("./debateService");
const { deleteCachePattern } = require("../config/redis");

// Recursively delete an argument and all its nested replies
const deleteArgumentAndReplies = async (argumentId) => {
    let deletedCount = 1; // Count this current argument
    
    // Grab all direct replies
    const replies = await Argument.find({ parentId: argumentId }).distinct('_id');
    
    // Dig down and delete replies of replies
    for (const replyId of replies) {
        deletedCount += await deleteArgumentAndReplies(replyId); 
    }
    
    // Clean up likes and the argument itself
    await Like.deleteMany({ argumentId });
    await Argument.findByIdAndDelete(argumentId);

    return deletedCount;
};

// Add a brand new argument to the debate
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

    // Update debate count and activity
    await Debate.updateOne(
        { _id: debateId },
        {
            $inc: { argumentsCount: 1 },
            $set: { lastActivityAt: new Date() },
        }
    );

    // Keep trending scores fresh
    await recalcTrendingScore(debateId);

    // Clear cache before sending live updates
    await deleteCachePattern("debates:*");
    await deleteCachePattern(`debate:single:*${debateId}*`);

    // Broadcast the new argument (wrapped in try/catch so sockets don't break the API)
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
        side: parent.side, // Replies inherit the same side as the parent
        parentId,
    });

    // Bump up the debate activity stats
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

    // Return the reply and trigger a notification if they replied to someone else
    return {
        argument: populated,
        alert: parent.author.toString() !== userId.toString()
            ? "Your argument received a reply"
            : null,
    };
};

// Load all arguments and nest the replies
const getArgumentsByDebate = async (debateId, userId) => {
    const allArgs = await Argument.find({ debateId })
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .limit(200) // Hard cap so massive debates don't crash the server
        .lean();

    const argMap = {};
    const topLevel = [];

    // Setup empty reply arrays for everyone
    allArgs.forEach((arg) => {
        arg.replies = [];
        argMap[arg._id.toString()] = arg;
    });

    // Group replies under their parent arguments
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

    // Figure out which ones the current user has liked
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

// Toggle a like on an argument
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

    // No self-liking allowed!
    if (argument.author.toString() === userId.toString()) {
        const error = new Error("You cannot like your own argument");
        error.statusCode = 403;
        throw error;
    }

    const existingLike = await Like.findOne({ userId, argumentId });
    let liked, alert;

    if (existingLike) {
        // Remove the like
        await existingLike.deleteOne();
        argument.likes = Math.max(0, argument.likes - 1);
        await argument.save();
        await User.findByIdAndUpdate(argument.author, { $inc: { points: -1 } });
        liked = false;
        alert = null;
    } else {
        // Add the like
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

// Delete an argument and perfectly clean up its replies
const deleteArgument = async (argumentId, userId, userRole) => {
    const argument = await Argument.findById(argumentId);
    
    if (!argument) {
        const error = new Error("Argument not found");
        error.statusCode = 404;
        throw error;
    }

    // Check if the user owns this or is an admin
    if (argument.author.toString() !== userId.toString() && userRole !== "admin") {
        const error = new Error("Not authorized to delete this argument");
        error.statusCode = 403;
        throw error;
    }

    const debateId = argument.debateId;

    // Kick off the recursive delete and get the total count of removed arguments
    const totalDeleted = await deleteArgumentAndReplies(argumentId);

    // Accurately drop the debate's argument count
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