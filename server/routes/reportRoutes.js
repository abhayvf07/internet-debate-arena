const express = require("express");
const {
    createReport,
    getReports,
    resolveReport,
} = require("../controllers/bookmarkReportController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReport);
router.get("/", protect, admin, getReports);
router.patch("/:id", protect, admin, resolveReport);

module.exports = router;
