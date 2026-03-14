const bookmarkService = require("../services/bookmarkService");
const reportService = require("../services/reportService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// @desc    Toggle bookmark on a debate
// @route   POST /api/bookmarks
const toggleBookmark = asyncHandler(async (req, res) => {
    const result = await bookmarkService.toggleBookmark(req.user._id, req.body.debateId);
    res.status(result.bookmarked ? 201 : 200).json(result);
});

// @desc    Get user's bookmarked debates
// @route   GET /api/bookmarks
const getBookmarks = asyncHandler(async (req, res) => {
    const result = await bookmarkService.getBookmarks(req.user._id);
    res.json(result);
});

// @desc    Report an argument
// @route   POST /api/reports
const createReport = asyncHandler(async (req, res) => {
    const result = await reportService.createReport({
        userId: req.user._id,
        ...req.body,
    });
    res.status(201).json(result);
});

// @desc    Get all pending reports (admin)
// @route   GET /api/reports
const getReports = asyncHandler(async (req, res) => {
    const result = await reportService.getReports();
    res.json(result);
});

// @desc    Resolve a report (admin)
// @route   PATCH /api/reports/:id
const resolveReport = asyncHandler(async (req, res) => {
    const result = await reportService.resolveReport(req.params.id);
    res.json(result);
});

module.exports = {
    toggleBookmark,
    getBookmarks,
    createReport,
    getReports,
    resolveReport,
};
