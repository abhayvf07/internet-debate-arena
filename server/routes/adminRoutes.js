const express = require("express");
const {
    getAllUsers,
    adminDeleteDebate,
    adminDeleteArgument,
    getReports,
    banUser,
    getAdminStats,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/ban", banUser);
router.delete("/debate/:id", adminDeleteDebate);
router.delete("/argument/:id", adminDeleteArgument);
router.get("/reports", getReports);

module.exports = router;
