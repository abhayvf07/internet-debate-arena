const express = require("express");
const {
    toggleBookmark,
    getBookmarks,
} = require("../controllers/bookmarkReportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, toggleBookmark);
router.get("/", protect, getBookmarks);

module.exports = router;
