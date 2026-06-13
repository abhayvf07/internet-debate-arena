// Joi schemas for argument and reply validation

const Joi = require("joi");

// Validate new argument: debateId, text, side
const createArgumentSchema = Joi.object({
    body: Joi.object({
        debateId: Joi.string().hex().length(24).required().messages({
            "string.empty": "debateId is required",
            "string.hex": "Invalid debate ID format",
            "string.length": "Invalid debate ID length",
        }),
        text: Joi.string().trim().required().max(2000).messages({
            "string.empty": "text is required",
            "string.max": "Argument text must be under 2000 characters",
        }),
        side: Joi.string().valid("Pro", "Con").required().messages({
            "any.only": "Side must be Pro or Con",
            "any.required": "side is required",
        }),
    }).unknown(true),
    query: Joi.object().unknown(true),
    params: Joi.object().unknown(true)
});

// Validate reply: parentId, text
const replyArgumentSchema = Joi.object({
    body: Joi.object({
        parentId: Joi.string().hex().length(24).required().messages({
            "string.empty": "parentId is required",
            "string.hex": "Invalid parent ID format",
            "string.length": "Invalid parent ID length",
        }),
        text: Joi.string().trim().required().max(2000).messages({
            "string.empty": "text is required",
            "string.max": "Argument text must be under 2000 characters",
        }),
    }).unknown(true),
    query: Joi.object().unknown(true),
    params: Joi.object().unknown(true)
});

module.exports = {
    createArgumentSchema,
    replyArgumentSchema,
};
