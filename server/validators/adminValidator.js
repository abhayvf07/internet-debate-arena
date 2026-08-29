// Joi schemas for admin operations
const Joi = require("joi");

// Validate role change: body must contain a valid role
const changeRoleValidator = Joi.object({
  body: Joi.object({
    role: Joi.string().valid("admin", "user").required().messages({
      "any.only": "Role must be either admin or user",
      "any.required": "Role is required",
    }),
  }).unknown(true),
  query: Joi.object().unknown(true),
  params: Joi.object().unknown(true),
});

module.exports = { changeRoleValidator };