const { validationResult } = require("express-validator");
const authService = require("../services/authService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// @desc    Register a new user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);
    res.json(result);
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user._id);
    res.json(user);
});

// @desc    Get user profile stats
// @route   GET /api/auth/stats
const getUserStats = asyncHandler(async (req, res) => {
    const stats = await authService.getUserStats(req.user._id);
    res.json(stats);
});

// @desc    Upload / update avatar
// @route   PUT /api/auth/avatar
const updateAvatar = asyncHandler(async (req, res) => {
    const user = await authService.updateAvatar(req.user._id, req.file);
    res.json(user);
});

// @desc    Get top users by reputation points
// @route   GET /api/users/leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const users = await authService.getLeaderboard(limit);
    res.json(users);
});

module.exports = { register, login, refreshToken, getMe, getUserStats, updateAvatar, getLeaderboard };
