const Joi = require("joi");

const registerValidator = Joi.object({
    body: Joi.object({
        name: Joi.string().trim().required().max(50).messages({
            "string.empty": "Name is required",
            "string.max": "Name must be under 50 characters",
        }),
        email: Joi.string().trim().required().email().messages({
            "string.empty": "Email is required",
            "string.email": "Invalid email format",
        }),
        password: Joi.string().required().min(6).messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters",
        })
    }).unknown(true),
    query: Joi.object().unknown(true),
    params: Joi.object().unknown(true)
});

const loginValidator = Joi.object({
    body: Joi.object({
        email: Joi.string().trim().required().email().messages({
            "string.empty": "Email is required",
            "string.email": "Invalid email format",
        }),
        password: Joi.string().required().messages({
            "string.empty": "Password is required"
        })
    }).unknown(true),
    query: Joi.object().unknown(true),
    params: Joi.object().unknown(true)
});

module.exports = { registerValidator, loginValidator };
