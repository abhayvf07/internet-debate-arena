const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

let io = null;

/**
 * Initialize Socket.io server
 * @param {import("http").Server} server — HTTP server instance
 */
const initSocket = (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            methods: ["GET", "POST"],
        },
    });

    // JWT authentication middleware for sockets
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(); // Allow unauthenticated connections (read-only)
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch {
            return next(); // Treat as unauthenticated
        }
    });

    io.on("connection", (socket) => {
        logger.debug(`Socket connected: ${socket.id}`);

        // Join a debate room
        socket.on("joinDebate", (debateId) => {
            if (debateId) {
                socket.join(`debate:${debateId}`);
                logger.debug(`Socket ${socket.id} joined debate:${debateId}`);
            }
        });

        // Leave a debate room
        socket.on("leaveDebate", (debateId) => {
            if (debateId) {
                socket.leave(`debate:${debateId}`);
            }
        });

        socket.on("disconnect", () => {
            logger.debug(`Socket disconnected: ${socket.id}`);
        });
    });

    logger.info("Socket.io initialized");
    return io;
};

/**
 * Get the Socket.io instance
 */
const getIO = () => io;

/**
 * Emit event to a debate room
 */
const emitToDebate = (debateId, event, data) => {
    if (io) {
        io.to(`debate:${debateId}`).emit(event, data);
    }
};

module.exports = { initSocket, getIO, emitToDebate };
