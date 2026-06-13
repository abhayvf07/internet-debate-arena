const jwt = require("jsonwebtoken");

// Crash if secrets are missing
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET must both be set');
    process.exit(1);
}

// 15-minute access token
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
};

// 7-day refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

module.exports = { generateAccessToken, generateRefreshToken };