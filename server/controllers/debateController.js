const { validationResult } = require("express-validator");
const debateService = require("../services/debateService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// @desc    Get all debates (paginated, filterable, sortable)
// @route   GET /api/debates
const getDebates = asyncHandler(async (req, res) => {
    const result = await debateService.getDebates(req.query);
    res.json(result);
});

// @desc    Search debates
// @route   GET /api/debates/search?q=
const searchDebates = asyncHandler(async (req, res) => {
    const result = await debateService.searchDebates(req.query);
    res.json(result);
});

// @desc    Get trending debates
// @route   GET /api/debates/trending
const getTrendingDebates = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await debateService.getTrendingDebates(limit);
    res.json(result);
});

// @desc    Get single debate
// @route   GET /api/debates/:id
const getDebateById = asyncHandler(async (req, res) => {
    const result = await debateService.getDebateById(req.params.id, req.query.userId);
    res.json(result);
});

// @desc    Increment view count
// @route   POST /api/debates/:id/view
const incrementView = asyncHandler(async (req, res) => {
    const result = await debateService.incrementView(req.params.id);
    res.json(result);
});

// @desc    Vote on a debate (Pro or Con)
// @route   POST /api/debates/:id/vote
const voteOnDebate = asyncHandler(async (req, res) => {
    const result = await debateService.voteOnDebate(
        req.params.id,
        req.body.side,
        req.user._id
    );
    res.json(result);
});

// @desc    Create a debate
// @route   POST /api/debates
const createDebate = asyncHandler(async (req, res) => {
    const result = await debateService.createDebate({
        ...req.body,
        userId: req.user._id,
    });
    res.status(201).json(result);
});

// @desc    Delete a debate (admin or creator)
// @route   DELETE /api/debates/:id
const deleteDebate = asyncHandler(async (req, res) => {
    const result = await debateService.deleteDebate(req.params.id, req.user);
    res.json(result);
});

module.exports = {
    getDebates,
    searchDebates,
    getTrendingDebates,
    getDebateById,
    incrementView,
    voteOnDebate,
    createDebate,
    deleteDebate,
};
