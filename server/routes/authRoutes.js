const express = require("express");
const {
    register, login, refreshToken, getMe, getUserStats, updateAvatar,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
    registerValidator,
    loginValidator,
} = require("../validators/authValidator");

const router = express.Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/refresh-token", refreshToken);
router.get("/me", protect, getMe);
router.get("/stats", protect, getUserStats);
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);

module.exports = router;
