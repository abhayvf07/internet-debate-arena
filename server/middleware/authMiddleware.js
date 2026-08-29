// Auth middleware
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getCache, setCache } = require("../config/redis");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = await getCache(`user:auth:${decoded.id}`);

      if (!user) {
        user = await User.findById(decoded.id)
          .select("-password -refreshToken")
          .lean();
        if (user) {
          await setCache(`user:auth:${decoded.id}`, user, 3600); // 1 hour
        }
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.isBanned) {
        return res
          .status(403)
          .json({ message: "Your account has been banned" });
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