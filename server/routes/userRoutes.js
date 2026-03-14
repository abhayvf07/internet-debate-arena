const express = require("express");
const { getLeaderboard } = require("../controllers/authController");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

const router = express.Router();

// GET /api/users/leaderboard — cached 120s
router.get("/leaderboard", cacheMiddleware("users:leaderboard", 120), getLeaderboard);

module.exports = router;
