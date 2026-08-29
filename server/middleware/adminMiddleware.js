const asyncHandler = require("express-async-handler");

// Admin guard
const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    // Set the status code, then throw the error.
    // Your errorMiddleware will catch this and send the JSON response.
    res.status(403);
    throw new Error("Access denied — admin only");
  }
});

module.exports = { adminOnly };