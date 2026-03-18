const Joi = require("joi");

const createArgumentSchema = Joi.object({
    body: Joi.object({
        debateId: Joi.string().hex().length(24).required().messages({
            "string.empty": "debateId is required",
            "string.hex": "Invalid debate ID format",
            "string.length": "Invalid debate ID length",
        }),
        text: Joi.string().trim().required().messages({
            "string.empty": "text is required",
        }),
        side: Joi.string().valid("Pro", "Con").required().messages({
            "any.only": "Side must be Pro or Con",
            "any.required": "side is required",
        }),
    }).unknown(true),
    query: Joi.object().unknown(true),
    params: Joi.object().unknown(true)
});

const replyArgumentSchema = Joi.object({
    body: Joi.object({
        parentId: Joi.string().hex().length(24).required().messages({
            "string.empty": "parentId is required",
            "string.hex": "Invalid parent ID format",
            "string.length": "Invalid parent ID length",
        }),
        text: Joi.string().trim().required().messages({
            "string.empty": "text is required",
        }),
    }).unknown(true),
    query: Joi.object().unknown(true),
    params: Joi.object().unknown(true)
});

module.exports = {
    createArgumentSchema,
    replyArgumentSchema,
};
