const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes — require valid JWT
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password -refreshToken");

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            // Check if user is banned
            if (user.isBanned) {
                return res.status(403).json({ message: "Your account has been banned" });
            }

            req.user = user;
            return next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

// Admin-only guard
const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Not authorized as admin" });
    }
};

module.exports = { protect, admin };
