// Admin service — user management, content moderation, and platform stats
const User = require("../models/User");
const Debate = require("../models/Debate");
const Argument = require("../models/Argument");
const Vote = require("../models/Vote");
const Like = require("../models/Like");
const Bookmark = require("../models/Bookmark");
const Report = require("../models/Report");
const { paginate } = require("../utils/pagination");
const { deleteCache, deleteCachePattern } = require("../config/redis");
const { emitToDebate } = require("../socket/index");
const { getReports } = require("./reportService");

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

  await deleteCachePattern("debates:*");
  await deleteCachePattern(`debate:single:*${debateId}*`);

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
    { $inc: { argumentsCount: -allArgIds.length } },
  );

  await deleteCachePattern("debates:*");
  await deleteCachePattern(`debate:single:*${argument.debateId}*`);

  // Notify debate room about deleted argument
  try {
    emitToDebate(argument.debateId.toString(), "argumentDeleted", {
      argumentId,
    });
  } catch (err) {
    console.error("Socket emit failed in adminDeleteArgument:", err.message);
  }

  return { message: "Argument and related data deleted" };
};

// Toggle ban status on a user
const banUser = async (userId, reason) => {
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

  const banning = !user.isBanned;
  user.isBanned = banning;

  if (banning) {
    user.banReason = reason || null;
    user.bannedAt = new Date();
  } else {
    user.banReason = null;
    user.bannedAt = null;
  }

  user.refreshToken = null;
  await user.save();

  await deleteCache(`user:auth:${user._id.toString()}`);

  return {
    message: user.isBanned ? "User banned" : "User unbanned",
    isBanned: user.isBanned,
  };
};

// Change a user's role (admin/user)
const changeUserRole = async (userId, newRole, requestingUserId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent admin from demoting themselves
  if (user._id.toString() === requestingUserId.toString()) {
    const error = new Error("You cannot change your own role");
    error.statusCode = 400;
    throw error;
  }

  user.role = newRole;
  await user.save();

  await deleteCache(`user:auth:${user._id.toString()}`);

  return {
    message: `User role changed to ${newRole}`,
    role: user.role,
  };
};

// Get platform-wide stats
const getAdminStats = async () => {
  const [
    totalUsers,
    totalDebates,
    pendingReports,
    totalArguments,
    totalBannedUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Debate.countDocuments(),
    Report.countDocuments({ status: "pending" }),
    Argument.countDocuments(),
    User.countDocuments({ isBanned: true }),
  ]);

  // Top 5 most-reported users (by pending reports on their arguments)
  const topReportedUsers = await Report.aggregate([
    { $match: { status: "pending" } },
    {
      $lookup: {
        from: "arguments",
        localField: "argumentId",
        foreignField: "_id",
        as: "arg",
      },
    },
    { $unwind: "$arg" },
    { $group: { _id: "$arg.author", reportCount: { $sum: 1 } } },
    { $sort: { reportCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        reportCount: 1,
        name: "$user.name",
        email: "$user.email",
      },
    },
  ]);

  return {
    totalUsers,
    totalDebates,
    pendingReports,
    totalArguments,
    totalBannedUsers,
    topReportedUsers,
  };
};

module.exports = {
  getAllUsers,
  adminDeleteDebate,
  adminDeleteArgument,
  getReports,
  banUser,
  changeUserRole,
  getAdminStats,
};