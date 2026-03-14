import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "";

let socket = null;

/**
 * Get or create socket connection
 */
export const getSocket = (token) => {
    if (socket?.connected) return socket;

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

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Join a debate room
 */
export const joinDebateRoom = (debateId) => {
    if (socket?.connected) {
        socket.emit("joinDebate", debateId);
    }
};

/**
 * Leave a debate room
 */
export const leaveDebateRoom = (debateId) => {
    if (socket?.connected) {
        socket.emit("leaveDebate", debateId);
    }
};

export default { getSocket, disconnectSocket, joinDebateRoom, leaveDebateRoom };
