const winston = require("winston");
const path = require("path");

const logDir = path.join(__dirname, "..", "logs");

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
    })
);

// JSON format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    transports: [
        // Console — colorized, dev-friendly
        new winston.transports.Console({ format: consoleFormat }),

        // File — errors only
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 3,
        }),

        // File — all logs
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
            format: fileFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 3,
        }),
    ],
});

// Morgan-compatible stream for HTTP request logging
logger.stream = {
    write: (message) => logger.info(message.trim()),
};

module.exports = logger;
