import { Server } from "socket.io";
import { logger } from "../shared/utils/logger.js";

let io = null;

export const initSocket = (httpServer, clientUrl) => {
    io = new Server(httpServer, {
        cors: {
            origin: clientUrl || "http://localhost:5173",
            methods: ["GET", "POST", "PATCH"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // Join Hospital Room
        socket.on("join:hospital", (hospitalId) => {
            if (hospitalId) {
                socket.join(`hospital:${hospitalId}`);
                logger.info(`Socket ${socket.id} joined hospital:${hospitalId}`);
            }
        });

        // Join Doctor Room
        socket.on("join:doctor", (doctorId) => {
            if (doctorId) {
                socket.join(`doctor:${doctorId}`);
                logger.info(`Socket ${socket.id} joined doctor:${doctorId}`);
            }
        });

        // Join Public Display Room
        socket.on("join:display", (hospitalId) => {
            if (hospitalId) {
                socket.join(`display:${hospitalId}`);
                logger.info(`Socket ${socket.id} joined display:${hospitalId}`);
            }
        });

        socket.on("disconnect", () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized!");
    }
    return io;
};