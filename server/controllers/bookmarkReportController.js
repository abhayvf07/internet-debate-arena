// Bookmark & Report controller — delegates to bookmarkService and reportService
const bookmarkService = require("../services/bookmarkService");
const reportService = require("../services/reportService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// POST /api/bookmarks
const toggleBookmark = asyncHandler(async (req, res) => {
  const result = await bookmarkService.toggleBookmark(
    req.user._id,
    req.body.debateId,
  );
  res.status(result.bookmarked ? 201 : 200).json(result);
});

// GET /api/bookmarks
const getBookmarks = asyncHandler(async (req, res) => {
  const result = await bookmarkService.getBookmarks(req.user._id);
  res.json(result);
});

// POST /api/reports
const createReport = asyncHandler(async (req, res) => {
  const result = await reportService.createReport({
    userId: req.user._id,
    ...req.body,
  });
  res.status(201).json(result);
});

// GET /api/reports
const getReports = asyncHandler(async (req, res) => {
  const result = await reportService.getReports(req.query);
  res.json(result);
});

// PATCH /api/reports/:id
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