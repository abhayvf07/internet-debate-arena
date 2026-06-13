// Report routes — create (user), list and resolve (admin only)

const express = require("express");
const {
    createReport,
    getReports,
    resolveReport,
} = require("../controllers/bookmarkReportController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", protect, createReport);
router.get("/", protect, adminOnly, getReports);
router.patch("/:id", protect, adminOnly, resolveReport);

module.exports = router;
