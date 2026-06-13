// Load env vars
require("dotenv").config(); 

// Crash if frontend URL is missing in production
if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
  console.error('FATAL: CLIENT_URL must be set in production');
  process.exit(1);
}

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

const { errorHandler } = require("./middleware/errorMiddleware");
const { initSocket } = require("./socket/index");

const app = express();
const server = http.createServer(app);

// Setup real-time sockets
initSocket(server);

// Add basic security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Allow frontend to connect
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

// Prevent database injection and XSS attacks
app.use(mongoSanitize());
app.use(xss());

// Log requests for debugging
app.use(morgan(":method :url :status :response-time ms"));

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Block spam to protect the server
const authLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 5, // Strict limit for logins
    message: { message: "Too many auth requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100, // Normal limit for APIs
    message: { message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Setup routes
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/users", generalLimiter, require("./routes/userRoutes"));
app.use("/api/debates", generalLimiter, require("./routes/debateRoutes"));
app.use("/api/arguments", generalLimiter, require("./routes/argumentRoutes"));
app.use("/api/bookmarks", generalLimiter, require("./routes/bookmarkRoutes"));
app.use("/api/reports", generalLimiter, require("./routes/reportRoutes"));
app.use("/api/admin", generalLimiter, require("./routes/adminRoutes"));

// Quick check to see if API is alive
app.get("/", (req, res) => {
    res.json({ message: "Internet Debate Arena API is running" });
});

// Handle unknown URLs
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Catch all server errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB before starting the server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1); 
  }
};

startServer();