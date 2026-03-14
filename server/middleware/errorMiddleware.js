const logger = require("../utils/logger");

/**
 * Global Error Handling Middleware
 * Catches and formats all errors consistently
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId (CastError)
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Resource not found — invalid ID";
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue).join(", ");
        message = `Duplicate value for: ${field}`;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        const messages = Object.values(err.errors).map((e) => e.message);
        message = messages.join(". ");
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token has expired";
    }

    // Log with Winston
    if (statusCode >= 500) {
        logger.error(`${statusCode} - ${message} - ${req.method} ${req.originalUrl} - ${err.stack}`);
    } else {
        logger.warn(`${statusCode} - ${message} - ${req.method} ${req.originalUrl}`);
    }

    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

/**
 * Wrap async route handlers so errors are forwarded to errorHandler
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
