// User routes — leaderboard (cached 120s)
const express = require("express");
const { getLeaderboard } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

const router = express.Router();

router.get(
  "/leaderboard",
  protect,
  cacheMiddleware("users:leaderboard", 120),
  getLeaderboard,
);

module.exports = router;