import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./shared/errors/errorHandler.js";
import AppError from "./shared/errors/AppError.js";
import { logger } from "./shared/utils/logger.js";
import patientRoutes from "./modules/patient/routes/patient.routes.js";
import doctorRoutes from "./modules/doctor/routes/doctor.routes.js";
import appointmentRoutes from "./modules/appointment/routes/appointment.routes.js";
import visitRoutes from "./modules/visit/routes/visit.routes.js";
import queueRoutes from "./modules/queue/routes/queue.routes.js";
import hospitalRoutes from "./modules/settings/routes/hospital.routes.js";

const app = express();

// Stream morgan logs to winston
const morganStream = {
    write: (message) => logger.info(message.trim()),
};

// Middlewares
app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(morgan("dev", { stream: morganStream }));

app.use("/api/v1/hospitals", hospitalRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/visits", visitRoutes);
app.use("/api/v1/queue", queueRoutes);

// Health check API
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Doctor Queue Management API is running",
    });
});

app.get("/api/v1/test-error", (req, res, next) => {
    next(new AppError("This is a test error", 400));
});

// Handle undefined routes
app.use(notFound);
// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
