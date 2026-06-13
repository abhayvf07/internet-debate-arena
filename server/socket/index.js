// Socket.io server — JWT auth, debate rooms, and live event broadcasting

const jwt = require("jsonwebtoken");

let io = null;

// Initialize Socket.io with CORS and auth middleware
const initSocket = (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            methods: ["GET", "POST"],
        },
    });

    // Auth middleware — guests allowed as read-only
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(); 
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch {
            return next();
        }
    });

    io.on("connection", (socket) => {
        console.debug(`Socket connected: ${socket.id}`);

        // Join a debate room (must be valid MongoDB ObjectId)
        socket.on('joinDebate', (debateId) => {
            if (debateId && /^[a-f\d]{24}$/i.test(debateId)) { 
                socket.join(`debate:${debateId}`);
                console.debug(`Socket ${socket.id} joined debate:${debateId}`);
            }
        });

        // Leave a debate room
        socket.on("leaveDebate", (debateId) => {
            if (debateId) {
                socket.leave(`debate:${debateId}`);
            }
        });

        socket.on("disconnect", () => {
            console.debug(`Socket disconnected: ${socket.id}`);
        });
    });

    console.log("Socket.io initialized");
    return io;
};

// Get the socket instance for use in other files
const getIO = () => io;

// Send a live update to everyone in a specific debate room
const emitToDebate = (debateId, event, data) => {
    if (io) {
        io.to(`debate:${debateId}`).emit(event, data);
    }
};

module.exports = { initSocket, getIO, emitToDebate };