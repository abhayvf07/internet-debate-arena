// Socket.io client — connect, disconnect, and room management

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

let socket = null;
let currentToken = null;

// Get or create socket connection
// Reconnects if the token has changed (e.g. user logged out and back in)
export const getSocket = (token) => {
    // If socket is connected but token changed, disconnect and reconnect
    if (socket?.connected && token !== currentToken) {
        socket.disconnect();
        socket = null;
    }

    if (socket?.connected) return socket;

    currentToken = token;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
        console.log("Socket connected");
    });

    socket.on("connect_error", () => {
        console.log("Socket reconnecting...");
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
    });

    return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        currentToken = null;
    }
};

// Join a debate room
export const joinDebateRoom = (debateId) => {
    if (socket?.connected) {
        socket.emit("joinDebate", debateId);
    }
};

// Leave a debate room
export const leaveDebateRoom = (debateId) => {
    if (socket) {
        socket.emit("leaveDebate", debateId);
    }
};

export default { getSocket, disconnectSocket, joinDebateRoom, leaveDebateRoom };
