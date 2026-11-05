import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./shared/utils/logger.js";
import { initSocket } from "./sockets/socketManager.js";

const startServer = async () => {
    try {
        await connectDB();

        // Create standard HTTP server around Express app
        const httpServer = http.createServer(app);

        // Initialize Socket.IO
        initSocket(httpServer, env.clientUrl);
        logger.info("Socket.IO initialized successfully");

        httpServer.listen(env.port, () => {
            logger.info(`Server running on http://localhost:${env.port}`);
        });
    } catch (error) {
        logger.error("Server startup failed:", { error: error.message });
        process.exit(1);
    }
};

startServer();