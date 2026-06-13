// User routes — leaderboard (cached 120s)

const express = require("express");
const { getLeaderboard } = require("../controllers/authController");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

const router = express.Router();

router.get("/leaderboard", cacheMiddleware("users:leaderboard", 120), getLeaderboard);

module.exports = router;