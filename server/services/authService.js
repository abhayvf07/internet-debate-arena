const User = require("../models/User");
const Debate = require("../models/Debate");
const Argument = require("../models/Argument");
const Vote = require("../models/Vote");
const crypto = require("crypto");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

// Hash refresh token before storage
const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

// Shared user response shape
const buildUserResponse = (user, accessToken, refreshToken) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    points: user.points,
    avatar: user.avatar,
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
    // Backward compat — some frontend code reads user.token
    token: accessToken || undefined,
});

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    return buildUserResponse(user, accessToken, refreshToken);
};

/**
 * Login user
 */
const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (user.isBanned) {
        const error = new Error("Your account has been banned");
        error.statusCode = 403;
        throw error;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    return buildUserResponse(user, accessToken, refreshToken);
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (token) => {
    const jwt = require("jsonwebtoken");

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
        const error = new Error("Invalid or expired refresh token");
        error.statusCode = 401;
        throw error;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Compare hashed tokens
    const hashedToken = hashToken(token);
    if (user.refreshToken !== hashedToken) {
        const error = new Error("Refresh token mismatch");
        error.statusCode = 401;
        throw error;
    }

    if (user.isBanned) {
        const error = new Error("Your account has been banned");
        error.statusCode = 403;
        throw error;
    }

    const newAccessToken = generateAccessToken(user._id);
    return { accessToken: newAccessToken };
};

/**
 * Get current user profile
 */
const getMe = async (userId) => {
    return User.findById(userId).select("-password -refreshToken");
};

/**
 * Get user profile stats
 */
const getUserStats = async (userId) => {
    const [debatesCreated, argumentsPosted, votesReceived] = await Promise.all([
        Debate.countDocuments({ creator: userId }),
        Argument.countDocuments({ author: userId }),
        (async () => {
            const userDebateIds = await Debate.find({ creator: userId }).distinct("_id");
            return Vote.countDocuments({ debateId: { $in: userDebateIds } });
        })(),
    ]);

    return { debatesCreated, argumentsPosted, votesReceived };
};

/**
 * Upload / update avatar
 */
const updateAvatar = async (userId, file) => {
    if (!file) {
        const error = new Error("Please upload an image file");
        error.statusCode = 400;
        throw error;
    }

    const avatarPath = `/uploads/avatars/${file.filename}`;
    return User.findByIdAndUpdate(
        userId,
        { avatar: avatarPath },
        { new: true }
    ).select("-password -refreshToken");
};

/**
 * Get top users by points (leaderboard)
 */
const getLeaderboard = async (limit = 20) => {
    return User.find({ isBanned: { $ne: true } })
        .select("name points role createdAt avatar")
        .sort({ points: -1 })
        .limit(limit);
};

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    getMe,
    getUserStats,
    updateAvatar,
    getLeaderboard,
};
