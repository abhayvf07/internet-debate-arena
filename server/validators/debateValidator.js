const Joi = require("joi");
// Import CATEGORIES from your Debate model
const { CATEGORIES } = require("../models/Debate"); 

// Validate new debate: title, description, category, tags
const createDebateSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().trim().max(150).required().messages({
      "string.empty": "Title is required",
      "string.max": "Title must be under 150 characters",
    }),
    description: Joi.string().trim().max(2000).required().messages({
      "string.empty": "Description is required",
      "string.max": "Description must be under 2000 characters",
    }),
    category: Joi.string()
      .valid(...CATEGORIES) // Hardcoded list ki jagah imported array use kiya
      .optional()
      .messages({ "any.only": "Invalid category" }),
    tags: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string())
      .optional(),
  }).unknown(true),
  query: Joi.object().unknown(true),
  params: Joi.object().unknown(true),
});

module.exports = {
  createDebateSchema,
};