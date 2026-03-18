const express = require("express");
const {
    createArgument,
    replyToArgument,
    getArgumentsByDebate,
    likeArgument,
    deleteArgument,
} = require("../controllers/argumentController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/joiValidator");
const { createArgumentSchema, replyArgumentSchema } = require("../validators/argumentValidator");

const router = express.Router();

// Public
router.get("/:debateId", getArgumentsByDebate);

// Protected
router.post("/", protect, validate(createArgumentSchema), createArgument);
router.post("/reply", protect, validate(replyArgumentSchema), replyToArgument);
router.post("/like", protect, likeArgument);
router.delete("/:id", protect, deleteArgument);

module.exports = router;
