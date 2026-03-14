const express = require("express");
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
const { debateValidator } = require("../validators/debateValidator");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

const router = express.Router();

// Public routes
router.get("/search", searchDebates);
router.get("/trending", cacheMiddleware("debates:trending", 60), getTrendingDebates);
router.get("/", getDebates);
router.get("/:id", getDebateById);

// Protected routes
router.post("/", protect, debateValidator, createDebate);
router.post("/:id/view", incrementView);
router.post("/:id/vote", protect, voteOnDebate);
router.delete("/:id", protect, deleteDebate);

module.exports = router;
