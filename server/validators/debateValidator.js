const { body } = require("express-validator");

const debateValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 150 })
        .withMessage("Title must be under 150 characters"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 2000 })
        .withMessage("Description must be under 2000 characters"),
    body("category")
        .optional()
        .isIn([
            "Technology",
            "Politics",
            "Society",
            "Economy",
            "Education",
            "Environment",
            "Science",
            "Ethics",
            "Business",
            "Entertainment",
            "Health",
            "Sports",
            "Other",
        ])
        .withMessage("Invalid category"),
];

module.exports = { debateValidator };
