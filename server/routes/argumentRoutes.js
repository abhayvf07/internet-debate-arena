// Argument routes

const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    createArgument,
    replyToArgument,
    getArgumentsByDebate,
    likeArgument,
    deleteArgument,
} = require("../controllers/argumentController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/joiValidator");
const { createArgumentSchema, replyArgumentSchema } = require("../validators/argumentValidator");

// 50 likes per minute per IP
const likeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50,
    message: { message: "Too many like requests, please slow down" },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();

// Public
router.get("/:debateId", getArgumentsByDebate);

// Protected
router.post("/", protect, validate(createArgumentSchema), createArgument);
router.post("/reply", protect, validate(replyArgumentSchema), replyToArgument);
router.post("/like", protect, likeLimiter, likeArgument);
router.delete("/:id", protect, deleteArgument);

module.exports = router;
