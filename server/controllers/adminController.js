const adminService = require("../services/adminService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
    const result = await adminService.getAllUsers(req.query);
    res.json(result);
});

// @desc    Delete a debate (admin)
// @route   DELETE /api/admin/debate/:id
const adminDeleteDebate = asyncHandler(async (req, res) => {
    const result = await adminService.adminDeleteDebate(req.params.id);
    res.json(result);
});

// @desc    Delete an argument (admin)
// @route   DELETE /api/admin/argument/:id
const adminDeleteArgument = asyncHandler(async (req, res) => {
    const result = await adminService.adminDeleteArgument(req.params.id);
    res.json(result);
});

// @desc    Get all pending reports (admin)
// @route   GET /api/admin/reports
const getReports = asyncHandler(async (req, res) => {
    const result = await adminService.getReports();
    res.json(result);
});

// @desc    Ban/unban a user (admin)
// @route   PATCH /api/admin/users/:id/ban
const banUser = asyncHandler(async (req, res) => {
    const result = await adminService.banUser(req.params.id);
    res.json(result);
});

// @desc    Get admin stats overview
// @route   GET /api/admin/stats
const getAdminStats = asyncHandler(async (req, res) => {
    const result = await adminService.getAdminStats();
    res.json(result);
});

module.exports = {
    getAllUsers,
    adminDeleteDebate,
    adminDeleteArgument,
    getReports,
    banUser,
    getAdminStats,
};
