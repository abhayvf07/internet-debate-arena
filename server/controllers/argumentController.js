const argumentService = require("../services/argumentService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// @desc    Create a top-level argument
// @route   POST /api/arguments
const createArgument = asyncHandler(async (req, res) => {
    const result = await argumentService.createArgument({
        ...req.body,
        userId: req.user._id,
    });
    res.status(201).json(result);
});

// @desc    Reply to an argument
// @route   POST /api/arguments/reply
const replyToArgument = asyncHandler(async (req, res) => {
    const result = await argumentService.replyToArgument({
        ...req.body,
        userId: req.user._id,
    });
    res.status(201).json(result);
});

// @desc    Get arguments for a debate (with nested replies)
// @route   GET /api/arguments/:debateId
const getArgumentsByDebate = asyncHandler(async (req, res) => {
    const result = await argumentService.getArgumentsByDebate(
        req.params.debateId,
        req.query.userId
    );
    res.json(result);
});

// @desc    Like/unlike an argument (toggle)
// @route   POST /api/arguments/like
const likeArgument = asyncHandler(async (req, res) => {
    const result = await argumentService.likeArgument(
        req.body.argumentId,
        req.user._id
    );
    res.json(result);
});

// @desc    Delete an argument
// @route   DELETE /api/arguments/:id
const deleteArgument = asyncHandler(async (req, res) => {
    const result = await argumentService.deleteArgument(
        req.params.id,
        req.user._id,
        req.user.role
    );
    res.json(result);
});

module.exports = {
    createArgument,
    replyToArgument,
    getArgumentsByDebate,
    likeArgument,
    deleteArgument,
};
