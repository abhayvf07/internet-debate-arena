require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const http = require("http");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const logger = require("./utils/logger");
const { errorHandler } = require("./middleware/errorMiddleware");
const { initSocket } = require("./socket/index");

// Connect to database
const app = express();

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Security Middleware 
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(mongoSanitize());
app.use(xss()); // Sanitize against XSS

// Request logging via Winston
app.use(morgan(":method :url :status :response-time ms", { stream: logger.stream }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Rate Limiters ──
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Stricter for auth
    message: { message: "Too many auth requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});
const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── API Routes ──
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/users", generalLimiter, require("./routes/userRoutes"));
app.use("/api/debates", generalLimiter, require("./routes/debateRoutes"));
app.use("/api/arguments", generalLimiter, require("./routes/argumentRoutes"));
app.use("/api/bookmarks", generalLimiter, require("./routes/bookmarkRoutes"));
app.use("/api/reports", generalLimiter, require("./routes/reportRoutes"));
app.use("/api/admin", generalLimiter, require("./routes/adminRoutes"));

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Internet Debate Arena API is running" });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after DB connection is established to avoid handling requests without DB access
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();