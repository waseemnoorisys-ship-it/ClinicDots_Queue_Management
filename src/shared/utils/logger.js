import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log directory: backend/logs
const logDirectory = path.join(__dirname, "../../../logs");

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format for terminal console
const consoleFormat = combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack }) => {
        return `[${timestamp}] ${level}: ${stack || message}`;
    })
);

// Format for disk files (JSON or clean text)
const fileFormat = combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack }) => {
        return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message}`;
    })
);

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    transports: [
        // 1. Console transport
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // 2. Dedicated error file (errors only)
        new winston.transports.File({
            filename: path.join(logDirectory, "error.log"),
            level: "error",
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5MB rotation
            maxFiles: 5,
        }),
        // 3. Dedicated combined file (all logs)
        new winston.transports.File({
            filename: path.join(logDirectory, "combined.log"),
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5MB rotation
            maxFiles: 5,
        }),

        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" })
    ],
});