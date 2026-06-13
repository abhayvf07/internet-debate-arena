// Debate routes — CRUD, search, trending, voting, views

const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    getDebates,
    searchDebates,
    getTrendingDebates,
    getDebateById,
    incrementView,
    voteOnDebate,
    createDebate,
    deleteDebate,
} = require("../controllers/debateController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/joiValidator");
const { createDebateSchema } = require("../validators/debateValidator");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

// 50 votes per minute per IP
const voteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50,
    message: { message: "Too many vote requests, please slow down" },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();

// Public
router.get("/search", searchDebates);
router.get("/trending", cacheMiddleware("debates:trending", 60), getTrendingDebates);
router.get("/", cacheMiddleware("debates:list", 60), getDebates);
router.get("/:id", cacheMiddleware("debate:single", 60), getDebateById);

// Protected
router.post("/", protect, validate(createDebateSchema), createDebate);
router.post("/:id/view", incrementView);
router.post("/:id/vote", protect, voteLimiter, voteOnDebate);
router.delete("/:id", protect, deleteDebate);

module.exports = router;
