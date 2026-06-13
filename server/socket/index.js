const jwt = require("jsonwebtoken");

let io = null;

// Start up the real-time Socket.io server
const initSocket = (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            methods: ["GET", "POST"],
        },
    });

    // Check for a login token, but still allow guests to connect as read-only
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
            return next(); // If the token is fake/expired, just treat them as a guest
        }
    });

    io.on("connection", (socket) => {
        console.debug(`Socket connected: ${socket.id}`);

        // Join a debate room (Strict check: must be a valid MongoDB ObjectId!)
        socket.on('joinDebate', (debateId) => {
            if (debateId && /^[a-f\d]{24}$/i.test(debateId)) { 
                socket.join(`debate:${debateId}`);
                console.debug(`Socket ${socket.id} joined debate:${debateId}`);
            }
        });

        // Leave the room when the user exits the debate page
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

// Expose the socket instance so we can grab it in other files
const getIO = () => io;

// Broadcast a live update to everyone currently viewing a specific debate
const emitToDebate = (debateId, event, data) => {
    if (io) {
        io.to(`debate:${debateId}`).emit(event, data);
    }
};

module.exports = { initSocket, getIO, emitToDebate };