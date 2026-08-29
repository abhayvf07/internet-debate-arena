// Admin routes — all require auth + admin role
const express = require("express");
const {
  getAllUsers,
  adminDeleteDebate,
  adminDeleteArgument,
  getReports,
  banUser,
  changeUserRole,
  getAdminStats,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { validate } = require("../middleware/joiValidator");
const { changeRoleValidator } = require("../validators/adminValidator");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/role", validate(changeRoleValidator), changeUserRole);
router.delete("/debate/:id", adminDeleteDebate);
router.delete("/argument/:id", adminDeleteArgument);
router.get("/reports", getReports);

module.exports = router;