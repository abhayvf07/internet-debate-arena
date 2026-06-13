// Auth controller — delegates to authService

const authService = require("../services/authService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);
    res.json(result);
});

// POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user._id);
    res.json(user);
});

// GET /api/auth/stats
const getUserStats = asyncHandler(async (req, res) => {
    const stats = await authService.getUserStats(req.user._id);
    res.json(stats);
});

// PUT /api/auth/avatar
const updateAvatar = asyncHandler(async (req, res) => {
    const user = await authService.updateAvatar(req.user._id, req.file);
    res.json(user);
});

// GET /api/users/leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const users = await authService.getLeaderboard(limit);
    res.json(users);
});

module.exports = { register, login, refreshToken, getMe, getUserStats, updateAvatar, getLeaderboard };