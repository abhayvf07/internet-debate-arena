const express = require("express");
const {
    createArgument,
    replyToArgument,
    getArgumentsByDebate,
    likeArgument,
    deleteArgument,
} = require("../controllers/argumentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/:debateId", getArgumentsByDebate);

// Protected
router.post("/", protect, createArgument);
router.post("/reply", protect, replyToArgument);
router.post("/like", protect, likeArgument);
router.delete("/:id", protect, deleteArgument);

module.exports = router;
