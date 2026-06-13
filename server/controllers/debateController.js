// Debate controller — delegates to debateService

const debateService = require("../services/debateService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// GET /api/debates
const getDebates = asyncHandler(async (req, res) => {
    const result = await debateService.getDebates(req.query);
    res.json(result);
});

// GET /api/debates/search
const searchDebates = asyncHandler(async (req, res) => {
    const result = await debateService.searchDebates(req.query);
    res.json(result);
});

// GET /api/debates/trending
const getTrendingDebates = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const result = await debateService.getTrendingDebates(limit);
    res.json(result);
});

// GET /api/debates/:id
const getDebateById = asyncHandler(async (req, res) => {
    const result = await debateService.getDebateById(req.params.id, req.query.userId);
    res.json(result);
});

// POST /api/debates/:id/view
const incrementView = asyncHandler(async (req, res) => {
    const result = await debateService.incrementView(req.params.id);
    res.json(result);
});

// POST /api/debates/:id/vote
const voteOnDebate = asyncHandler(async (req, res) => {
    const result = await debateService.voteOnDebate(
        req.params.id,
        req.body.side,
        req.user._id
    );
    res.json(result);
});

// POST /api/debates
const createDebate = asyncHandler(async (req, res) => {
    const result = await debateService.createDebate({
        ...req.body,
        userId: req.user._id,
    });
    res.status(201).json(result);
});

// DELETE /api/debates/:id
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
