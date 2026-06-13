// Admin controller — delegates to adminService

const adminService = require("../services/adminService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
    const result = await adminService.getAllUsers(req.query);
    res.json(result);
});

// DELETE /api/admin/debate/:id
const adminDeleteDebate = asyncHandler(async (req, res) => {
    const result = await adminService.adminDeleteDebate(req.params.id);
    res.json(result);
});

// DELETE /api/admin/argument/:id
const adminDeleteArgument = asyncHandler(async (req, res) => {
    const result = await adminService.adminDeleteArgument(req.params.id);
    res.json(result);
});

// GET /api/admin/reports
const getReports = asyncHandler(async (req, res) => {
    const result = await adminService.getReports();
    res.json(result);
});

// PATCH /api/admin/users/:id/ban
const banUser = asyncHandler(async (req, res) => {
    const result = await adminService.banUser(req.params.id);
    res.json(result);
});

// GET /api/admin/stats
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
