// Global error handler and async wrapper

// Catches and formats all errors into consistent JSON responses
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Resource not found — invalid ID";
    }

    // Mongoose duplicate key
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

    if (statusCode >= 500) {
        console.error(`${statusCode} - ${message} - ${req.method} ${req.originalUrl} - ${err.stack}`);
    } else {
        console.warn(`${statusCode} - ${message} - ${req.method} ${req.originalUrl}`);
    }

    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

// Wraps async handlers so errors go to errorHandler automatically
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
