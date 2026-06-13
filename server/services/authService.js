const User = require("../models/User");
const Debate = require("../models/Debate");
const Argument = require("../models/Argument");
const Vote = require("../models/Vote");
const crypto = require("crypto");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

// Scramble the token before saving it to protect it if the DB ever leaks
const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

// Standardize the user info we send back to the frontend
const buildUserResponse = (user, accessToken, refreshToken) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    points: user.points,
    avatar: user.avatar,
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
    // Keep this for older frontend code that looks for "token"
    token: accessToken || undefined,
});

// Sign up a new user
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

    // Save the scrambled version of the refresh token
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    return buildUserResponse(user, accessToken, refreshToken);
};

// Log the user in if credentials match and they aren't banned
const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
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

    user.refreshToken = hashToken(refreshToken);
    await user.save();

    return buildUserResponse(user, accessToken, refreshToken);
};

// Swap a valid refresh token for a fresh access token
const refreshAccessToken = async (token) => {
    const jwt = require("jsonwebtoken");

    let decoded;
    try {
        // Strictly using the refresh secret here!
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
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

    // Make sure the token matches the one we saved in the DB
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

// Grab the logged-in user's profile info (safely hiding the password)
const getMe = async (userId) => {
    return User.findById(userId).select("-password -refreshToken");
};

// Tally up the user's site activity for their profile page
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

// Save a new profile picture
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

// Fetch the top-scoring users, skipping anyone who is banned
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