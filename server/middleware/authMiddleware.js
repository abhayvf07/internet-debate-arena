// JWT auth middleware — verifies token, checks ban status, attaches user to req

const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

module.exports = { protect };